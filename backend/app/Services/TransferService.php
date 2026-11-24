<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\TransferLeg;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class TransferService
{
    public function create(int $userId, string $amount, array $legs, ?string $description, ?string $idempotencyKey): Operation
    {
        if (bccomp($amount, '0', 4) <= 0 || ! isset($legs['out'], $legs['in'])) {
            throw new InvalidArgumentException('A transferência exige valor positivo e duas pernas.');
        }
        if ((int) $legs['out']['account_id'] === (int) $legs['in']['account_id']) {
            throw new FinancialInvariantViolation('A origem e o destino devem ser contas diferentes.');
        }

        return DB::transaction(function () use ($userId, $amount, $legs, $description, $idempotencyKey): Operation {
            if ($idempotencyKey !== null) {
                $existing = Operation::query()->where('user_id', $userId)->where('idempotency_key', $idempotencyKey)->first();
                if ($existing !== null) {
                    if ($existing->operation_type !== 'TRANSFER') throw new FinancialInvariantViolation('A chave de idempotência já foi usada por outra natureza de operação.');
                    return $existing->load('transferLegs', 'entries');
                }
            }

            $accountIds = [(int) $legs['out']['account_id'], (int) $legs['in']['account_id']];
            sort($accountIds);
            $accounts = FinancialAccount::query()->whereIn('id', $accountIds)->lockForUpdate()->get()->keyBy('id');
            foreach ($accountIds as $accountId) {
                $account = $accounts->get($accountId);
                if ($account === null || $account->user_id !== $userId || $account->status !== 'ACTIVE') {
                    throw new FinancialInvariantViolation('As contas da transferência devem pertencer ao utilizador e estar ativas.');
                }
            }

            $this->validateLeg($legs['out']);
            $this->validateLeg($legs['in']);
            $operationState = $this->operationState($legs['out']['state'], $legs['in']['state']);
            $operation = Operation::query()->create([
                'user_id' => $userId,
                'operation_type' => 'TRANSFER',
                'description' => $description,
                'state' => $operationState,
                'amount' => $amount,
                'idempotency_key' => $idempotencyKey,
            ]);

            foreach (['out' => 'OUT', 'in' => 'IN'] as $key => $direction) {
                $leg = $legs[$key];
                $transferLeg = TransferLeg::query()->create([
                    'user_id' => $userId, 'operation_id' => $operation->id, 'account_id' => $leg['account_id'],
                    'direction' => $direction, 'state' => $leg['state'], 'amount' => $amount,
                    'effective_at' => $leg['effective_at'] ?? null, 'planned_at' => $leg['planned_at'] ?? null,
                ]);
                if ($leg['state'] === 'REALIZED') $this->postLeg($userId, $operation, $transferLeg);
            }

            return $operation->fresh()->load('transferLegs', 'entries');
        });
    }

    public function confirm(int $userId, Operation $operation, TransferLeg $leg, string $effectiveAt): Operation
    {
        return DB::transaction(function () use ($userId, $operation, $leg, $effectiveAt): Operation {
            $operation = Operation::query()->lockForUpdate()->findOrFail($operation->id);
            $leg = TransferLeg::query()->lockForUpdate()->findOrFail($leg->id);
            $this->assertOwnership($userId, $operation, $leg);
            if ($leg->state !== 'PENDING') throw new FinancialInvariantViolation('Apenas uma perna pendente pode ser confirmada.');
            $account = FinancialAccount::query()->lockForUpdate()->find($leg->account_id);
            if ($account === null || $account->status !== 'ACTIVE') throw new FinancialInvariantViolation('A conta da perna não está ativa.');
            $leg->update(['state' => 'REALIZED', 'effective_at' => $effectiveAt]);
            $this->postLeg($userId, $operation, $leg);
            $this->refreshOperationState($operation);
            return $operation->fresh()->load('transferLegs', 'entries');
        });
    }

    private function validateLeg(array $leg): void
    {
        if (! in_array($leg['state'], ['PENDING', 'REALIZED'], true)) throw new FinancialInvariantViolation('Estado de perna inválido.');
        if ($leg['state'] === 'REALIZED' && empty($leg['effective_at'])) throw new FinancialInvariantViolation('Perna realizada exige data efetiva.');
        if ($leg['state'] === 'PENDING' && empty($leg['planned_at'])) throw new FinancialInvariantViolation('Perna pendente exige data prevista.');
    }

    private function postLeg(int $userId, Operation $operation, TransferLeg $leg): void
    {
        if (FinancialEntry::query()->where('operation_id', $operation->id)->where('account_id', $leg->account_id)->exists()) return;
        FinancialEntry::query()->create([
            'user_id' => $userId, 'operation_id' => $operation->id, 'account_id' => $leg->account_id,
            'amount' => $leg->amount, 'effect' => $leg->direction === 'IN' ? 'INCREASE' : 'DECREASE',
            'state' => 'REALIZED', 'effective_at' => $leg->effective_at,
        ]);
    }

    private function assertOwnership(int $userId, Operation $operation, TransferLeg $leg): void
    {
        if ($operation->user_id !== $userId || $leg->user_id !== $userId || $leg->operation_id !== $operation->id || $operation->operation_type !== 'TRANSFER') {
            throw new FinancialInvariantViolation('A transferência não pertence ao utilizador ou a perna é inválida.');
        }
    }

    private function refreshOperationState(Operation $operation): void
    {
        $states = $operation->transferLegs()->pluck('state')->all();
        $operation->update(['state' => $this->operationState($states[0], $states[1])]);
    }

    private function operationState(string $out, string $in): string
    {
        if ($out === 'REALIZED' && $in === 'REALIZED') return 'REALIZED';
        if ($out === 'CANCELLED' && $in === 'CANCELLED') return 'CANCELLED';
        if ($out === 'PENDING' && $in === 'PENDING') return 'PENDING';
        return 'PARTIAL';
    }
}
