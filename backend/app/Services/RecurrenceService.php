<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\Category;
use App\Models\RecurrenceOccurrence;
use App\Models\RecurrenceSchedule;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class RecurrenceService
{
    public function createSchedule(
        int $userId,
        string $nature,
        string $amount,
        int $categoryId,
        ?string $description,
        string $frequency,
        string $firstOccurrenceAt,
        ?string $endAt,
        ?string $idempotencyKey,
    ): RecurrenceSchedule {
        $this->assertAmount($amount);
        $this->assertFrequency($frequency);

        return DB::transaction(function () use ($userId, $nature, $amount, $categoryId, $description, $frequency, $firstOccurrenceAt, $endAt, $idempotencyKey): RecurrenceSchedule {
            if ($idempotencyKey !== null) {
                $existing = RecurrenceSchedule::query()
                    ->where('user_id', $userId)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();
                if ($existing !== null) {
                    return $existing->load('occurrences');
                }
            }

            $category = $this->categoryForUser($userId, $categoryId, $nature);
            $first = Carbon::parse($firstOccurrenceAt);
            $end = $endAt !== null ? Carbon::parse($endAt) : null;
            if ($end !== null && $end->lt($first)) {
                throw new FinancialInvariantViolation('A data de fim não pode ser anterior à primeira ocorrência.');
            }

            $schedule = RecurrenceSchedule::query()->create([
                'user_id' => $userId,
                'nature' => $nature,
                'amount' => $amount,
                'account_id' => null,
                'category_id' => $category->id,
                'description' => $description,
                'frequency' => $frequency,
                'first_occurrence_at' => $first,
                'status' => 'ACTIVE',
                'end_at' => $end,
                'idempotency_key' => $idempotencyKey,
            ]);

            $this->generateUntilLocked($schedule, $first);

            return $schedule->fresh()->load('occurrences');
        });
    }

    public function generate(int $userId, RecurrenceSchedule $schedule, string $until): RecurrenceSchedule
    {
        return DB::transaction(function () use ($userId, $schedule, $until): RecurrenceSchedule {
            $schedule = $this->lockSchedule($userId, $schedule);
            $limit = Carbon::parse($until);
            if ($limit->lt($schedule->first_occurrence_at)) {
                throw new FinancialInvariantViolation('A data limite não pode ser anterior à primeira ocorrência.');
            }
            $this->generateUntilLocked($schedule, $limit);

            return $schedule->fresh()->load('occurrences');
        });
    }

    public function listOccurrences(int $userId, RecurrenceSchedule $schedule, ?string $until = null)
    {
        $this->assertScheduleOwner($userId, $schedule);
        if ($until !== null) {
            $this->generate($userId, $schedule, $until);
        }

        return RecurrenceOccurrence::query()
            ->where('user_id', $userId)
            ->where('recurrence_schedule_id', $schedule->id)
            ->orderBy('scheduled_at')
            ->get();
    }

    public function materialize(int $userId, RecurrenceOccurrence $occurrence, int $accountId, string $effectiveAt): RecurrenceOccurrence
    {
        return DB::transaction(function () use ($userId, $occurrence, $accountId, $effectiveAt): RecurrenceOccurrence {
            $occurrence = RecurrenceOccurrence::query()->lockForUpdate()->findOrFail($occurrence->id);
            if ($occurrence->user_id !== $userId) {
                throw new FinancialInvariantViolation('A ocorrência não pertence ao utilizador.');
            }
            if ($occurrence->state === 'REALIZED') {
                return $occurrence->fresh()->load('operation.entries');
            }
            if ($occurrence->state !== 'PENDING') {
                throw new FinancialInvariantViolation('Apenas ocorrências pendentes podem ser materializadas.');
            }

            $schedule = RecurrenceSchedule::query()->findOrFail($occurrence->recurrence_schedule_id);
            if ($schedule->user_id !== $userId) {
                throw new FinancialInvariantViolation('A programação não pertence ao utilizador.');
            }

            $operation = app(BasicOperationService::class)->create(
                $userId,
                $schedule->nature,
                (string) $occurrence->amount,
                $accountId,
                (int) $occurrence->category_id,
                $occurrence->description,
                'REALIZED',
                $effectiveAt,
                null,
                'recurrence-occurrence-'.$occurrence->id,
            );

            $occurrence->update(['state' => 'REALIZED', 'operation_id' => $operation->id, 'account_id' => $accountId, 'effective_at' => $effectiveAt]);

            return $occurrence->fresh()->load('operation.entries');
        });
    }

    public function updateOccurrence(int $userId, RecurrenceOccurrence $occurrence, array $data): RecurrenceOccurrence
    {
        return DB::transaction(function () use ($userId, $occurrence, $data): RecurrenceOccurrence {
            $occurrence = $this->lockOccurrence($userId, $occurrence);
            $this->assertEditable($occurrence);
            $this->validateOverride($userId, $data, $occurrence->schedule->nature);
            $occurrence->update($this->editableFields($data));

            return $occurrence->fresh();
        });
    }

    public function updateOccurrenceAndFollowing(int $userId, RecurrenceOccurrence $occurrence, array $data): RecurrenceOccurrence
    {
        return DB::transaction(function () use ($userId, $occurrence, $data): RecurrenceOccurrence {
            $occurrence = $this->lockOccurrence($userId, $occurrence);
            $this->assertEditable($occurrence);
            $schedule = $occurrence->schedule()->lockForUpdate()->firstOrFail();
            $this->validateOverride($userId, $data, $schedule->nature);
            $fields = $this->editableFields($data);

            $schedule->update(array_intersect_key($fields, array_flip(['amount', 'account_id', 'category_id', 'description'])));
            RecurrenceOccurrence::query()
                ->where('recurrence_schedule_id', $schedule->id)
                ->where('scheduled_at', '>=', $occurrence->scheduled_at)
                ->where('state', 'PENDING')
                ->update($fields);

            return $occurrence->fresh();
        });
    }

    public function cancel(int $userId, RecurrenceOccurrence $occurrence): RecurrenceOccurrence
    {
        return DB::transaction(function () use ($userId, $occurrence): RecurrenceOccurrence {
            $occurrence = $this->lockOccurrence($userId, $occurrence);
            if ($occurrence->state !== 'PENDING') {
                throw new FinancialInvariantViolation('Apenas ocorrências pendentes podem ser canceladas.');
            }
            $occurrence->update(['state' => 'CANCELLED']);

            return $occurrence->fresh();
        });
    }

    private function generateUntilLocked(RecurrenceSchedule $schedule, Carbon $until): void
    {
        if ($schedule->status !== 'ACTIVE') {
            return;
        }
        $date = Carbon::parse($schedule->first_occurrence_at);
        $end = $schedule->end_at !== null && Carbon::parse($schedule->end_at)->lt($until)
            ? Carbon::parse($schedule->end_at) : $until;

        while ($date->lte($end)) {
            RecurrenceOccurrence::query()->firstOrCreate(
                ['recurrence_schedule_id' => $schedule->id, 'scheduled_at' => $date],
                [
                    'user_id' => $schedule->user_id,
                    'amount' => $schedule->amount,
                    'state' => 'PENDING',
                    'account_id' => null,
                    'category_id' => $schedule->category_id,
                    'description' => $schedule->description,
                ],
            );
            $date = $this->nextDate($date, $schedule->frequency);
        }
    }

    private function nextDate(Carbon $date, string $frequency): Carbon
    {
        return match ($frequency) {
            'DAILY' => $date->copy()->addDay(),
            'WEEKLY' => $date->copy()->addWeek(),
            'MONTHLY' => $date->copy()->addMonthNoOverflow(),
            default => throw new InvalidArgumentException('Periodicidade inválida.'),
        };
    }

    private function editableFields(array $data): array
    {
        return array_filter([
            'amount' => $data['amount'] ?? null,
            'category_id' => isset($data['category_id']) ? (int) $data['category_id'] : null,
            'description' => array_key_exists('description', $data) ? $data['description'] : null,
        ], static fn ($value): bool => $value !== null);
    }

    private function validateOverride(int $userId, array $data, string $nature): void
    {
        if (isset($data['amount'])) {
            $this->assertAmount((string) $data['amount']);
        }
        if (isset($data['category_id'])) {
            $this->categoryForUser($userId, (int) $data['category_id'], $nature);
        }
    }

    private function assertEditable(RecurrenceOccurrence $occurrence): void
    {
        if ($occurrence->state !== 'PENDING') {
            throw new FinancialInvariantViolation('Apenas ocorrências pendentes podem ser alteradas.');
        }
        if ($occurrence->scheduled_at->isPast()) {
            throw new FinancialInvariantViolation('Ocorrências passadas não podem ser reescritas.');
        }
    }

    private function categoryForUser(int $userId, int $categoryId, string $nature): Category
    {
        $category = Category::query()->find($categoryId);
        if ($category === null || $category->user_id !== $userId || $category->status !== 'ACTIVE' || $category->nature !== $nature) {
            throw new FinancialInvariantViolation('A categoria não pertence ao utilizador, não está ativa ou tem natureza incompatível.');
        }

        return $category;
    }

    private function lockSchedule(int $userId, RecurrenceSchedule $schedule): RecurrenceSchedule
    {
        $schedule = RecurrenceSchedule::query()->lockForUpdate()->findOrFail($schedule->id);
        $this->assertScheduleOwner($userId, $schedule);

        return $schedule;
    }

    private function lockOccurrence(int $userId, RecurrenceOccurrence $occurrence): RecurrenceOccurrence
    {
        $occurrence = RecurrenceOccurrence::query()->lockForUpdate()->findOrFail($occurrence->id);
        if ($occurrence->user_id !== $userId) {
            throw new FinancialInvariantViolation('A ocorrência não pertence ao utilizador.');
        }

        return $occurrence->load('schedule');
    }

    private function assertScheduleOwner(int $userId, RecurrenceSchedule $schedule): void
    {
        if ($schedule->user_id !== $userId) {
            throw new FinancialInvariantViolation('A programação não pertence ao utilizador.');
        }
    }

    private function assertAmount(string $amount): void
    {
        if (! preg_match('/^\d+(?:\.\d{1,4})?$/', $amount) || bccomp($amount, '0', 4) <= 0) {
            throw new InvalidArgumentException('O valor deve ser positivo e ter no máximo quatro casas decimais.');
        }
    }

    private function assertFrequency(string $frequency): void
    {
        if (! in_array($frequency, ['DAILY', 'WEEKLY', 'MONTHLY'], true)) {
            throw new InvalidArgumentException('Periodicidade inválida.');
        }
    }
}
