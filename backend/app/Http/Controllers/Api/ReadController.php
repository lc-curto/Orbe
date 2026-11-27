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
            ->get();
        $summaries = $invoiceSummaries->forInvoices($cards->flatMap(fn (Card $card) => $card->invoices->pluck('id'))->all());

        return response()->json([
            'data' => $cards->map(fn (Card $card): array => $this->cardPayload($card, $summaries))->values()->all(),
        ]);
    }

    public function card(Request $request, int $card, CardInvoiceSummaryService $invoiceSummaries): JsonResponse
    {
        $model = Card::query()
            ->where('user_id', $request->user()->id)
            ->with(['invoices' => fn ($query) => $query->orderByDesc('period_start')])
            ->findOrFail($card);
        $summaries = $invoiceSummaries->forInvoices($model->invoices->pluck('id')->all());

        return response()->json(['data' => $this->cardPayload($model, $summaries)]);
    }

    public function invoices(Request $request, CardInvoiceSummaryService $invoiceSummaries): JsonResponse
    {
        $invoices = CardInvoice::query()
            ->where('user_id', $request->user()->id)
            ->with('card')
            ->orderByDesc('period_start')
            ->get();
        $summaries = $invoiceSummaries->forInvoices($invoices->pluck('id')->all());

        return response()->json([
            'data' => $invoices->map(fn (CardInvoice $invoice): array => $this->invoicePayload($invoice, $summaries[$invoice->id] ?? null))->values()->all(),
        ]);
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

    /** @param array<int, array{obligation_amount:string,paid_amount:string,open_amount:string}> $summaries
     *  @return array<string, mixed>
     */
    private function cardPayload(Card $card, array $summaries): array
    {
        $invoices = $card->invoices
            ->map(fn (CardInvoice $invoice): array => $this->invoicePayload($invoice, $summaries[$invoice->id] ?? null));
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

    /** @param array{obligation_amount:string,paid_amount:string,open_amount:string}|null $summary
     *  @return array<string, mixed>
     */
    private function invoicePayload(CardInvoice $invoice, ?array $summary): array
    {
        $payload = $invoice->toArray();
        $payload['summary'] = $summary ?? [
            'obligation_amount' => '0.0000',
            'paid_amount' => '0.0000',
            'open_amount' => '0.0000',
        ];
        return $payload;
    }
}
