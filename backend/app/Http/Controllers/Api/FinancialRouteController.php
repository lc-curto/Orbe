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
        ]);

        $month = $validated['month'] ?? now()->format('Y-m');

        return response()->json([
            'data' => $service->build((int) $request->user()->id, $month),
        ]);
    }
}
