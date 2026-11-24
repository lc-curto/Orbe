<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Exceptions\FinancialInvariantViolation;
use App\Http\Controllers\Controller;
use App\Models\Operation;
use App\Models\TransferLeg;
use App\Services\TransferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

final class TransferController extends Controller
{
    public function store(Request $request, TransferService $service): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string', 'max:500'],
            'idempotency_key' => ['nullable', 'string', 'max:191'],
            'legs.out.account_id' => ['required', 'integer'],
            'legs.out.state' => ['required', 'in:PENDING,REALIZED'],
            'legs.out.effective_at' => ['nullable', 'date'],
            'legs.out.planned_at' => ['nullable', 'date'],
            'legs.in.account_id' => ['required', 'integer'],
            'legs.in.state' => ['required', 'in:PENDING,REALIZED'],
            'legs.in.effective_at' => ['nullable', 'date'],
            'legs.in.planned_at' => ['nullable', 'date'],
        ]);
        try {
            return response()->json(['data' => $service->create((int) $request->user()->id, (string) $data['amount'], $data['legs'], $data['description'] ?? null, $data['idempotency_key'] ?? null)], 201);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function confirm(Request $request, Operation $operation, TransferLeg $leg, TransferService $service): JsonResponse
    {
        $data = $request->validate(['effective_at' => ['required', 'date']]);
        try {
            return response()->json(['data' => $service->confirm((int) $request->user()->id, $operation, $leg, $data['effective_at'])]);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }
}
