<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\Operation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ReadController extends Controller
{
    public function cards(Request $request): JsonResponse
    {
        $cards = Card::query()
            ->where('user_id', $request->user()->id)
            ->with(['invoices' => fn ($query) => $query->orderByDesc('period_start')])
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $cards]);
    }

    public function card(Request $request, int $card): JsonResponse
    {
        $model = Card::query()
            ->where('user_id', $request->user()->id)
            ->with(['invoices' => fn ($query) => $query->orderByDesc('period_start')])
            ->findOrFail($card);

        return response()->json(['data' => $model]);
    }

    public function invoices(Request $request): JsonResponse
    {
        $invoices = CardInvoice::query()
            ->where('user_id', $request->user()->id)
            ->with('card')
            ->orderByDesc('period_start')
            ->get();

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
}
