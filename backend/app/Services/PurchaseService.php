<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\CardInvoice;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PurchaseAllocation;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class PurchaseService
{
    /** @param array<int, array{invoice_id:int, amount:numeric}> $allocations */
    public function create(int $userId, string $amount, array $allocations, ?string $idempotencyKey = null): Operation
    {
        if (bccomp($amount, '0', 4) <= 0 || $allocations === []) {
            throw new InvalidArgumentException('Compra e alocações devem ter valores positivos.');
        }
        return DB::transaction(function () use ($userId, $amount, $allocations, $idempotencyKey): Operation {
            if ($idempotencyKey !== null) {
                $existing = Operation::query()->where('user_id', $userId)->where('idempotency_key', $idempotencyKey)->first();
                if ($existing) return $existing;
            }
            $total = '0.0000';
            foreach ($allocations as $item) {
                if (bccomp((string) $item['amount'], '0', 4) <= 0) throw new FinancialInvariantViolation('Alocação inválida.');
                $total = bcadd($total, (string) $item['amount'], 4);
            }
            if (bccomp($total, $amount, 4) !== 0) throw new FinancialInvariantViolation('As alocações devem totalizar a compra.');

            $operation = Operation::query()->create([
                'user_id' => $userId, 'operation_type' => 'PURCHASE', 'state' => 'REALIZED',
                'amount' => $amount, 'effective_at' => now(), 'idempotency_key' => $idempotencyKey,
            ]);
            foreach ($allocations as $item) {
                $invoice = CardInvoice::query()->lockForUpdate()->findOrFail($item['invoice_id']);
                if ($invoice->user_id !== $userId) throw new FinancialInvariantViolation('A fatura não pertence ao utilizador.');
                $allocation = PurchaseAllocation::query()->create([
                    'purchase_operation_id' => $operation->id, 'invoice_id' => $invoice->id, 'amount' => $item['amount'],
                ]);
                FinancialEntry::query()->create([
                    'user_id' => $userId, 'operation_id' => $operation->id, 'invoice_id' => $invoice->id,
                    'purchase_allocation_id' => $allocation->id, 'amount' => $item['amount'],
                    'effect' => 'DECREASE', 'state' => 'REALIZED', 'effective_at' => now(),
                ]);
            }
            return $operation->fresh();
        });
    }
}
