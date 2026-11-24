<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\CardOpeningBalance;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\OpeningBalanceDistribution;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class CardOpeningBalanceService
{
    /** @param array<int, array{invoice_id:int, amount:numeric}> $distributions */
    public function create(int $userId, Card $card, string $declaredAmount, array $distributions): CardOpeningBalance
    {
        if ($card->user_id !== $userId || bccomp($declaredAmount, '0', 4) <= 0) {
            throw new FinancialInvariantViolation('Cartão ou valor inicial inválido.');
        }
        if ($distributions === []) {
            throw new InvalidArgumentException('É necessária pelo menos uma distribuição.');
        }

        return DB::transaction(function () use ($userId, $card, $declaredAmount, $distributions): CardOpeningBalance {
            $card = Card::query()->lockForUpdate()->findOrFail($card->id);
            if (CardOpeningBalance::query()->where('card_id', $card->id)->exists()) {
                throw new FinancialInvariantViolation('O cartão já possui saldo inicial.');
            }

            $total = '0.0000';
            foreach ($distributions as $item) {
                if (bccomp((string) $item['amount'], '0', 4) <= 0) {
                    throw new FinancialInvariantViolation('A distribuição deve ser positiva.');
                }
                $total = bcadd($total, (string) $item['amount'], 4);
            }
            if (bccomp($total, $declaredAmount, 4) > 0) {
                throw new FinancialInvariantViolation('As distribuições excedem o saldo inicial declarado.');
            }

            $operation = Operation::query()->create([
                'user_id' => $userId, 'operation_type' => 'CARD_OPENING_BALANCE',
                'state' => 'REALIZED', 'amount' => $declaredAmount,
                'effective_at' => now(), 'idempotency_key' => 'opening-balance:'.$card->id,
            ]);
            $opening = CardOpeningBalance::query()->create([
                'user_id' => $userId, 'card_id' => $card->id,
                'operation_id' => $operation->id, 'declared_amount' => $declaredAmount,
            ]);

            foreach ($distributions as $item) {
                $invoice = CardInvoice::query()->lockForUpdate()->findOrFail($item['invoice_id']);
                if ($invoice->user_id !== $userId || $invoice->card_id !== $card->id) {
                    throw new FinancialInvariantViolation('A fatura não pertence ao cartão/utilizador.');
                }
                $entry = FinancialEntry::query()->create([
                    'user_id' => $userId, 'operation_id' => $operation->id,
                    'invoice_id' => $invoice->id, 'amount' => $item['amount'],
                    'effect' => 'DECREASE', 'state' => 'PENDING',
                ]);
                OpeningBalanceDistribution::query()->create([
                    'opening_balance_id' => $opening->id, 'invoice_id' => $invoice->id,
                    'obligation_entry_id' => $entry->id, 'amount' => $item['amount'],
                ]);
            }
            return $opening->fresh();
        });
    }
}
