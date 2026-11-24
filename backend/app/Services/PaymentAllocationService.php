<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class PaymentAllocationService
{
    /**
     * @param array<int, array{obligation_entry_id:int, amount:numeric|string}> $allocations
     */
    public function allocate(Operation $payment, int $settlementEntryId, array $allocations): void
    {
        if ($allocations === []) {
            throw new InvalidArgumentException('É necessária pelo menos uma alocação.');
        }

        DB::transaction(function () use ($payment, $settlementEntryId, $allocations): void {
            $payment = Operation::query()->lockForUpdate()->findOrFail($payment->getKey());
            $settlement = FinancialEntry::query()->lockForUpdate()->findOrFail($settlementEntryId);

            if ($settlement->user_id !== $payment->user_id || $settlement->operation_id !== $payment->id) {
                throw new FinancialInvariantViolation('O lançamento de liquidação não pertence à operação/utilizador do pagamento.');
            }
            if ($settlement->account_id === null || $settlement->invoice_id !== null || $settlement->debt_id !== null || $settlement->effect !== 'DECREASE') {
                throw new FinancialInvariantViolation('O lançamento de liquidação deve ser uma saída de conta.');
            }

            $requested = '0.0000';
            foreach ($allocations as $allocation) {
                $requested = bcadd($requested, (string) $allocation['amount'], 4);
            }
            if (bccomp($requested, (string) $settlement->amount, 4) !== 0) {
                throw new FinancialInvariantViolation('A soma das alocações deve corresponder ao lançamento de liquidação.');
            }

            $seenObligations = [];
            foreach ($allocations as $allocation) {
                $amount = (string) $allocation['amount'];
                if (bccomp($amount, '0', 4) <= 0) {
                    throw new FinancialInvariantViolation('O valor de uma alocação deve ser positivo.');
                }

                $obligationId = (int) $allocation['obligation_entry_id'];
                if (isset($seenObligations[$obligationId])) {
                    throw new FinancialInvariantViolation('A mesma obrigação não pode ser repetida no mesmo pagamento.');
                }
                $seenObligations[$obligationId] = true;

                $obligation = FinancialEntry::query()->lockForUpdate()->findOrFail($obligationId);
                if ($obligation->user_id !== $payment->user_id || $obligation->invoice_id === null || $obligation->effect !== 'DECREASE') {
                    throw new FinancialInvariantViolation('A obrigação não pertence ao utilizador ou não é uma redução de fatura válida.');
                }

                $allocated = (string) PaymentAllocation::query()
                    ->where('obligation_entry_id', $obligation->id)
                    ->sum('amount');
                $reversed = (string) DB::table('payment_reversal_allocations as pra')
                    ->join('payment_allocations as pa', 'pa.id', '=', 'pra.original_payment_allocation_id')
                    ->where('pa.obligation_entry_id', $obligation->id)
                    ->sum('pra.amount');
                $available = bcsub((string) $obligation->amount, bcsub($allocated, $reversed, 4), 4);

                if (bccomp($amount, $available, 4) > 0) {
                    throw new FinancialInvariantViolation('A alocação excede o saldo disponível da obrigação.');
                }

                PaymentAllocation::query()->create([
                    'payment_operation_id' => $payment->id,
                    'settlement_entry_id' => $settlement->id,
                    'obligation_entry_id' => $obligation->id,
                    'amount' => $amount,
                ]);
            }
        });
    }
}
