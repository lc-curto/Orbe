<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class BasicOperationService
{
    public function create(
        int $userId,
        string $nature,
        string $amount,
        ?int $accountId,
        int $categoryId,
        ?string $description,
        string $state,
        ?string $effectiveAt,
        ?string $plannedAt,
        ?string $idempotencyKey,
    ): Operation {
        if (bccomp($amount, '0', 4) <= 0) {
            throw new InvalidArgumentException('O valor deve ser positivo.');
        }

        return DB::transaction(function () use ($userId, $nature, $amount, $accountId, $categoryId, $description, $state, $effectiveAt, $plannedAt, $idempotencyKey): Operation {
            if ($idempotencyKey !== null) {
                $existing = Operation::query()
                    ->where('user_id', $userId)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();
                if ($existing !== null) {
                    return $existing->load('entries');
                }
            }

            if (! in_array($state, ['REALIZED', 'PENDING'], true)) {
                throw new FinancialInvariantViolation('Estado de operação inválido.');
            }
            if ($state === 'REALIZED' && $accountId === null) {
                throw new FinancialInvariantViolation('Uma operação realizada exige uma conta ativa.');
            }
            if ($state === 'PENDING' && $accountId !== null) {
                throw new FinancialInvariantViolation('Uma operação pendente não pode ter destino financeiro associado.');
            }

            $account = $accountId !== null
                ? FinancialAccount::query()->lockForUpdate()->find($accountId)
                : null;
            $category = Category::query()->find($categoryId);
            if ($state === 'REALIZED' && ($account === null || $account->user_id !== $userId || $account->status !== 'ACTIVE')) {
                throw new FinancialInvariantViolation('A conta não pertence ao utilizador ou não está ativa.');
            }
            if ($category === null || $category->user_id !== $userId || $category->status !== 'ACTIVE' || $category->nature !== $nature) {
                throw new FinancialInvariantViolation('A categoria não pertence ao utilizador, não está ativa ou tem natureza incompatível.');
            }
            if ($state === 'REALIZED' && $effectiveAt === null) {
                throw new FinancialInvariantViolation('Uma operação realizada exige data efetiva.');
            }
            if ($state === 'PENDING' && $plannedAt === null) {
                throw new FinancialInvariantViolation('Uma operação pendente exige data prevista.');
            }

            $operation = Operation::query()->create([
                'user_id' => $userId,
                'category_id' => $categoryId,
                'account_id' => $accountId,
                'operation_type' => $nature,
                'description' => $description,
                'state' => $state,
                'amount' => $amount,
                'effective_at' => $effectiveAt,
                'planned_at' => $plannedAt,
                'idempotency_key' => $idempotencyKey,
            ]);

            if ($state === 'REALIZED') {
                FinancialEntry::query()->create([
                    'user_id' => $userId,
                    'operation_id' => $operation->id,
                    'account_id' => $accountId,
                    'amount' => $amount,
                    'effect' => $nature === 'INCOME' ? 'INCREASE' : 'DECREASE',
                    'state' => 'REALIZED',
                    'effective_at' => $effectiveAt,
                ]);
            }

            return $operation->fresh()->load('entries');
        });
    }

    public function confirm(int $userId, Operation $operation, int $accountId, string $effectiveAt): Operation
    {
        return DB::transaction(function () use ($userId, $operation, $accountId, $effectiveAt): Operation {
            $operation = Operation::query()->lockForUpdate()->with('entries')->findOrFail($operation->id);
            if ($operation->user_id !== $userId) {
                throw new FinancialInvariantViolation('A operação não pertence ao utilizador.');
            }
            if ($operation->state !== 'PENDING' || ! in_array($operation->operation_type, ['INCOME', 'EXPENSE'], true)) {
                throw new FinancialInvariantViolation('Apenas despesas e receitas pendentes podem ser confirmadas.');
            }
            if ($operation->entries->isNotEmpty()) {
                throw new FinancialInvariantViolation('A operação já possui efeitos financeiros.');
            }

            $account = FinancialAccount::query()->lockForUpdate()->find($accountId);
            if ($account === null || $account->user_id !== $userId || $account->status !== 'ACTIVE') {
                throw new FinancialInvariantViolation('A conta de confirmação não pertence ao utilizador ou não está ativa.');
            }

            $operation->update(['account_id' => $accountId, 'state' => 'REALIZED', 'effective_at' => $effectiveAt]);
            FinancialEntry::query()->create([
                'user_id' => $userId,
                'operation_id' => $operation->id,
                'account_id' => $accountId,
                'amount' => $operation->amount,
                'effect' => $operation->operation_type === 'INCOME' ? 'INCREASE' : 'DECREASE',
                'state' => 'REALIZED',
                'effective_at' => $effectiveAt,
            ]);

            return $operation->fresh()->load('entries');
        });
    }
}
