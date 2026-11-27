<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\Operation;
use App\Services\CardInvoiceSummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ReadController extends Controller
{
    public function cards(Request $request, CardInvoiceSummaryService $invoiceSummaries): JsonResponse
    {
        $cards = Card::query()
            ->where('user_id', $request->user()->id)
            ->with(['invoices' => fn ($query) => $query->orderByDesc('period_start')])
            ->orderBy('name')
            ->get()
            ->map(fn (Card $card): array => $this->cardPayload($card, $invoiceSummaries));

        return response()->json(['data' => $cards]);
    }

    public function card(Request $request, int $card, CardInvoiceSummaryService $invoiceSummaries): JsonResponse
    {
        $model = Card::query()
            ->where('user_id', $request->user()->id)
            ->with(['invoices' => fn ($query) => $query->orderByDesc('period_start')])
            ->findOrFail($card);

        return response()->json(['data' => $this->cardPayload($model, $invoiceSummaries)]);
    }

    public function invoices(Request $request, CardInvoiceSummaryService $invoiceSummaries): JsonResponse
    {
        $invoices = CardInvoice::query()
            ->where('user_id', $request->user()->id)
            ->with('card')
            ->orderByDesc('period_start')
            ->get()
            ->map(fn (CardInvoice $invoice): array => $this->invoicePayload($invoice, $invoiceSummaries));

        return response()->json(['data' => $invoices]);
    }

    public function operations(Request $request): JsonResponse
    {
        $operations = Operation::query()
            ->where('user_id', $request->user()->id)
            ->with(['category', 'account', 'entries.invoice', 'entries.account'])
            ->orderByDesc('effective_at')
            ->orderByDesc('planned_at')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $operations]);
    }

    /** @return array<string, mixed> */
    private function cardPayload(Card $card, CardInvoiceSummaryService $invoiceSummaries): array
    {
        $invoices = $card->invoices
            ->map(fn (CardInvoice $invoice): array => $this->invoicePayload($invoice, $invoiceSummaries));
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
    private function invoicePayload(CardInvoice $invoice, CardInvoiceSummaryService $invoiceSummaries): array
    {
        $payload = $invoice->toArray();
        $payload['summary'] = $invoiceSummaries->forInvoice((int) $invoice->id);
        return $payload;
    }
}
