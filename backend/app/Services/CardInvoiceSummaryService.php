<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FinancialEntry;
use App\Models\PaymentAllocation;
use Illuminate\Support\Facades\DB;

final class CardInvoiceSummaryService
{
    /** @return array{obligation_amount:string,paid_amount:string,open_amount:string} */
    public function forInvoice(int $invoiceId): array
    {
        $obligation = (string) FinancialEntry::query()
            ->where('invoice_id', $invoiceId)
            ->whereHas('operation', fn ($query) => $query->whereIn('operation_type', ['PURCHASE', 'CARD_OPENING_BALANCE']))
            ->sum('amount');

        $paid = (string) PaymentAllocation::query()
            ->join('financial_entries as obligation_entries', 'obligation_entries.id', '=', 'payment_allocations.obligation_entry_id')
            ->where('obligation_entries.invoice_id', $invoiceId)
            ->sum('payment_allocations.amount');

        $reversed = (string) DB::table('payment_reversal_allocations as reversals')
            ->join('payment_allocations as allocations', 'allocations.id', '=', 'reversals.original_payment_allocation_id')
            ->join('financial_entries as obligation_entries', 'obligation_entries.id', '=', 'allocations.obligation_entry_id')
            ->where('obligation_entries.invoice_id', $invoiceId)
            ->sum('reversals.amount');

        $netPaid = bcsub($paid, $reversed, 4);

        return [
            'obligation_amount' => bcadd($obligation, '0', 4),
            'paid_amount' => $netPaid,
            'open_amount' => bcsub($obligation, $netPaid, 4),
        ];
    }
}
