<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;

final class CardInvoiceSummaryService
{
    /** @return array{obligation_amount:string,paid_amount:string,open_amount:string} */
    public function forInvoice(int $invoiceId): array
    {
        return $this->forInvoices([$invoiceId])[$invoiceId] ?? [
            'obligation_amount' => '0.0000',
            'paid_amount' => '0.0000',
            'open_amount' => '0.0000',
        ];
    }

    /**
     * @param  int[]  $invoiceIds
     * @return array<int, array{obligation_amount:string,paid_amount:string,open_amount:string}>
     */
    public function forInvoices(array $invoiceIds): array
    {
        $ids = array_values(array_unique(array_map('intval', $invoiceIds)));
        if ($ids === []) {
            return [];
        }

        $obligations = DB::table('financial_entries')
            ->join('operations', 'operations.id', '=', 'financial_entries.operation_id')
            ->whereIn('financial_entries.invoice_id', $ids)
            ->whereIn('operations.operation_type', ['PURCHASE', 'CARD_OPENING_BALANCE'])
            ->select('financial_entries.invoice_id')
            ->selectRaw('SUM(financial_entries.amount) as amount')
            ->groupBy('financial_entries.invoice_id')
            ->pluck('amount', 'invoice_id');

        $paid = DB::table('payment_allocations as allocations')
            ->join('financial_entries as obligation_entries', 'obligation_entries.id', '=', 'allocations.obligation_entry_id')
            ->whereIn('obligation_entries.invoice_id', $ids)
            ->select('obligation_entries.invoice_id')
            ->selectRaw('SUM(allocations.amount) as amount')
            ->groupBy('obligation_entries.invoice_id')
            ->pluck('amount', 'invoice_id');

        $reversed = DB::table('payment_reversal_allocations as reversals')
            ->join('payment_allocations as allocations', 'allocations.id', '=', 'reversals.original_payment_allocation_id')
            ->join('financial_entries as obligation_entries', 'obligation_entries.id', '=', 'allocations.obligation_entry_id')
            ->whereIn('obligation_entries.invoice_id', $ids)
            ->select('obligation_entries.invoice_id')
            ->selectRaw('SUM(reversals.amount) as amount')
            ->groupBy('obligation_entries.invoice_id')
            ->pluck('amount', 'invoice_id');

        $summaries = [];
        foreach ($ids as $invoiceId) {
            $obligation = bcadd((string) ($obligations[$invoiceId] ?? '0'), '0', 4);
            $netPaid = bcsub(
                (string) ($paid[$invoiceId] ?? '0'),
                (string) ($reversed[$invoiceId] ?? '0'),
                4,
            );
            $summaries[$invoiceId] = [
                'obligation_amount' => $obligation,
                'paid_amount' => $netPaid,
                'open_amount' => bcsub($obligation, $netPaid, 4),
            ];
        }

        return $summaries;
    }
}
