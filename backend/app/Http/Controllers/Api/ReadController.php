<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class ReadController extends Controller
{
    public function cards(Request $request): JsonResponse
    {
        $cards = Card::query()
            ->where('user_id', $request->user()->id)
            ->with(['invoices' => fn ($query) => $query->orderByDesc('period_start')])
            ->orderBy('name')
            ->get()
            ->map(fn (Card $card): array => $this->cardPayload($card));

        return response()->json(['data' => $cards]);
    }

    public function card(Request $request, int $card): JsonResponse
    {
        $model = Card::query()
            ->where('user_id', $request->user()->id)
            ->with(['invoices' => fn ($query) => $query->orderByDesc('period_start')])
            ->findOrFail($card);

        return response()->json(['data' => $this->cardPayload($model)]);
    }

    public function invoices(Request $request): JsonResponse
    {
        $invoices = CardInvoice::query()
            ->where('user_id', $request->user()->id)
            ->with('card')
            ->orderByDesc('period_start')
            ->get()
            ->map(fn (CardInvoice $invoice): array => $this->invoicePayload($invoice));

        return response()->json(['data' => $invoices]);
    }

    public function operations(Request $request): JsonResponse
    {
        $operations = Operation::query()
            ->where('user_id', $request->user()->id)
            ->with(['entries.invoice', 'entries.account'])
            ->orderByDesc('effective_at')
            ->orderByDesc('planned_at')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $operations]);
    }

    /** @return array<string, mixed> */
    private function cardPayload(Card $card): array
    {
        $invoices = $card->invoices
            ->map(fn (CardInvoice $invoice): array => $this->invoicePayload($invoice));
        $used = $invoices->reduce(
            fn (string $carry, array $invoice): string => bcadd($carry, $invoice['summary']['open_amount'], 4),
            '0.0000',
        );

        return array_merge($card->toArray(), [
            'summary' => [
                'used_amount' => $used,
                'available_amount' => bcsub((string) $card->credit_limit, $used, 4),
            ],
            'invoices' => $invoices->values()->all(),
        ]);
    }

    /** @return array<string, mixed> */
    private function invoicePayload(CardInvoice $invoice): array
    {
        $payload = $invoice->toArray();
        $payload['summary'] = $this->invoiceSummary((int) $invoice->id);
        return $payload;
    }

    /** @return array<string, string> */
    private function invoiceSummary(int $invoiceId): array
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
            'obligation_amount' => $obligation,
            'paid_amount' => $netPaid,
            'open_amount' => bcsub($obligation, $netPaid, 4),
        ];
    }
}
