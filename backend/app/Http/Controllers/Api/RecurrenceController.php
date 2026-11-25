<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Exceptions\FinancialInvariantViolation;
use App\Http\Controllers\Controller;
use App\Models\RecurrenceOccurrence;
use App\Models\RecurrenceSchedule;
use App\Services\RecurrenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

final class RecurrenceController extends Controller
{
    public function store(Request $request, RecurrenceService $service): JsonResponse
    {
        $data = $request->validate([
            'nature' => ['required', 'in:EXPENSE,INCOME'],
            'amount' => ['required', 'regex:/^\d+(\.\d{1,4})?$/'],
            'account_id' => ['required', 'integer'],
            'category_id' => ['required', 'integer'],
            'description' => ['nullable', 'string', 'max:500'],
            'frequency' => ['required', 'in:DAILY,WEEKLY,MONTHLY'],
            'first_occurrence_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date'],
            'idempotency_key' => ['nullable', 'string', 'max:191'],
        ]);

        try {
            $schedule = $service->createSchedule(
                (int) $request->user()->id,
                $data['nature'],
                (string) $data['amount'],
                (int) $data['account_id'],
                (int) $data['category_id'],
                $data['description'] ?? null,
                $data['frequency'],
                $data['first_occurrence_at'],
                $data['end_at'] ?? null,
                $data['idempotency_key'] ?? null,
            );
            return response()->json(['data' => $schedule], 201);
        } catch (FinancialInvariantViolation|InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $data = RecurrenceSchedule::query()
            ->where('user_id', $request->user()->id)
            ->with(['account', 'category'])
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['data' => $data]);
    }

    public function generate(Request $request, RecurrenceSchedule $schedule, RecurrenceService $service): JsonResponse
    {
        $this->assertScheduleOwner($request, $schedule);
        $data = $request->validate(['until' => ['required', 'date']]);
        try {
            return response()->json(['data' => $service->generate((int) $request->user()->id, $schedule, $data['until'])]);
        } catch (FinancialInvariantViolation|InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function occurrences(Request $request, RecurrenceSchedule $schedule, RecurrenceService $service): JsonResponse
    {
        $this->assertScheduleOwner($request, $schedule);
        $data = $request->validate(['until' => ['nullable', 'date']]);
        try {
            return response()->json(['data' => $service->listOccurrences((int) $request->user()->id, $schedule, $data['until'] ?? null)]);
        } catch (FinancialInvariantViolation|InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function materialize(Request $request, RecurrenceOccurrence $occurrence, RecurrenceService $service): JsonResponse
    {
        $this->assertOccurrenceOwner($request, $occurrence);
        $data = $request->validate(['effective_at' => ['required', 'date']]);
        try {
            return response()->json(['data' => $service->materialize((int) $request->user()->id, $occurrence, $data['effective_at'])]);
        } catch (FinancialInvariantViolation|InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function update(Request $request, RecurrenceOccurrence $occurrence, RecurrenceService $service): JsonResponse
    {
        $this->assertOccurrenceOwner($request, $occurrence);
        $data = $this->validatedUpdate($request);
        try {
            return response()->json(['data' => $service->updateOccurrence((int) $request->user()->id, $occurrence, $data)]);
        } catch (FinancialInvariantViolation|InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function updateAndFollowing(Request $request, RecurrenceOccurrence $occurrence, RecurrenceService $service): JsonResponse
    {
        $this->assertOccurrenceOwner($request, $occurrence);
        $data = $this->validatedUpdate($request);
        try {
            return response()->json(['data' => $service->updateOccurrenceAndFollowing((int) $request->user()->id, $occurrence, $data)]);
        } catch (FinancialInvariantViolation|InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function cancel(Request $request, RecurrenceOccurrence $occurrence, RecurrenceService $service): JsonResponse
    {
        $this->assertOccurrenceOwner($request, $occurrence);
        try {
            return response()->json(['data' => $service->cancel((int) $request->user()->id, $occurrence)]);
        } catch (FinancialInvariantViolation|InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    private function validatedUpdate(Request $request): array
    {
        return $request->validate([
            'amount' => ['sometimes', 'regex:/^\d+(\.\d{1,4})?$/'],
            'account_id' => ['sometimes', 'integer'],
            'category_id' => ['sometimes', 'integer'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);
    }

    private function assertScheduleOwner(Request $request, RecurrenceSchedule $schedule): void
    {
        abort_unless($schedule->user_id === $request->user()->id, 404);
    }

    private function assertOccurrenceOwner(Request $request, RecurrenceOccurrence $occurrence): void
    {
        abort_unless($occurrence->user_id === $request->user()->id, 404);
    }
}
