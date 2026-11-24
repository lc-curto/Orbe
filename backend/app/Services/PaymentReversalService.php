<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use App\Models\PaymentReversalAllocation;
use Illuminate\Support\Facades\DB;

final class PaymentReversalService
{
    public function reverse(int $userId, PaymentAllocation $allocation, string $amount, ?string $idempotencyKey = null): PaymentReversalAllocation
    {
        return DB::transaction(function () use ($userId, $allocation, $amount, $idempotencyKey): PaymentReversalAllocation {
            if ($idempotencyKey !== null) {
                $existing = Operation::query()
                    ->where('user_id', $userId)
                    ->where('idempotency_key', $idempotencyKey)
                    ->where('operation_type', 'PAYMENT_REVERSAL')
                    ->first();
                if ($existing !== null) {
                    return PaymentReversalAllocation::query()
                        ->where('reversal_operation_id', $existing->id)
                        ->firstOrFail();
                }
            }
            $allocation = PaymentAllocation::query()->lockForUpdate()->findOrFail($allocation->id);
            $payment = Operation::query()->lockForUpdate()->findOrFail($allocation->payment_operation_id);
            $settlement = FinancialEntry::query()->lockForUpdate()->findOrFail($allocation->settlement_entry_id);
            $obligation = FinancialEntry::query()->lockForUpdate()->findOrFail($allocation->obligation_entry_id);
            if ($payment->user_id !== $userId || $settlement->user_id !== $userId || $obligation->user_id !== $userId) {
                throw new FinancialInvariantViolation('A alocação não pertence ao utilizador.');
            }
            $reversed = (string) PaymentReversalAllocation::query()->where('original_payment_allocation_id', $allocation->id)->sum('amount');
            $available = bcsub((string) $allocation->amount, $reversed, 4);
            if (bccomp($amount, '0', 4) <= 0 || bccomp($amount, $available, 4) > 0) {
                throw new FinancialInvariantViolation('A reversão excede o valor ainda reversível.');
            }
            $operation = Operation::query()->create([
                'user_id' => $userId, 'operation_type' => 'PAYMENT_REVERSAL', 'state' => 'REALIZED',
                'amount' => $amount, 'effective_at' => now(), 'source_operation_id' => $payment->id,
                'idempotency_key' => $idempotencyKey,
            ]);
            $accountEntry = FinancialEntry::query()->create([
                'user_id' => $userId, 'operation_id' => $operation->id, 'account_id' => $settlement->account_id,
                'amount' => $amount, 'effect' => 'INCREASE', 'state' => 'REALIZED', 'effective_at' => now(),
            ]);
            $invoiceEntry = FinancialEntry::query()->create([
                'user_id' => $userId, 'operation_id' => $operation->id, 'invoice_id' => $obligation->invoice_id,
                'amount' => $amount, 'effect' => 'INCREASE', 'state' => 'REALIZED', 'effective_at' => now(),
            ]);
            return PaymentReversalAllocation::query()->create([
                'reversal_operation_id' => $operation->id, 'original_payment_allocation_id' => $allocation->id,
                'account_reversal_entry_id' => $accountEntry->id, 'invoice_reversal_entry_id' => $invoiceEntry->id,
                'amount' => $amount,
            ]);
        });
    }
}
