<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinancialRouteReadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class FinancialRouteController extends Controller
{
    public function index(Request $request, FinancialRouteReadService $service): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['sometimes', 'required', 'date_format:Y-m'],
            'months' => ['sometimes', 'required', 'integer', 'min:1', 'max:24'],
        ]);

        $month = $validated['month'] ?? now()->format('Y-m');
        $months = (int) ($validated['months'] ?? 24);

        return response()->json([
            'data' => $service->build((int) $request->user()->id, $month, $months),
        ]);
    }
}
