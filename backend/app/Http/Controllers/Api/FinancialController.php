<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Exceptions\FinancialInvariantViolation;
use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use App\Services\CardOpeningBalanceService;
use App\Services\PaymentAllocationService;
use App\Services\PaymentReversalService;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class FinancialController extends Controller
{
    public function openingBalance(Request $request, Card $card, CardOpeningBalanceService $service): JsonResponse
    {
        $user = $request->user();
        Gate::authorize('update', $card);
        $data = $request->validate([
            'declared_amount' => ['required', 'numeric', 'gt:0'],
            'distributions' => ['required', 'array', 'min:1'],
            'distributions.*.invoice_id' => ['required', 'integer', 'distinct'],
            'distributions.*.amount' => ['required', 'numeric', 'gt:0'],
        ]);

        try {
            $opening = $service->create((int) $user->id, $card, (string) $data['declared_amount'], $data['distributions']);
            return response()->json(['data' => $opening->load('distributions')], 201);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function purchase(Request $request, PurchaseService $service): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'idempotency_key' => ['nullable', 'string', 'max:191'],
            'allocations' => ['required', 'array', 'min:1'],
            'allocations.*.invoice_id' => ['required', 'integer', 'distinct'],
            'allocations.*.amount' => ['required', 'numeric', 'gt:0'],
        ]);

        try {
            $operation = $service->create((int) $user->id, (string) $data['amount'], $data['allocations'], $data['idempotency_key'] ?? null);
            return response()->json(['data' => $operation->load('entries')], 201);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function allocatePayment(Request $request, Operation $payment, PaymentAllocationService $service): JsonResponse
    {
        $user = $request->user();
        Gate::authorize('update', $payment);
        $data = $request->validate([
            'settlement_entry_id' => ['required', 'integer'],
            'allocations' => ['required', 'array', 'min:1'],
            'allocations.*.obligation_entry_id' => ['required', 'integer', 'distinct'],
            'allocations.*.amount' => ['required', 'numeric', 'gt:0'],
        ]);

        try {
            $service->allocate($payment, (int) $data['settlement_entry_id'], $data['allocations']);
            return response()->json(['data' => $payment->load('entries')], 201);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function reversePayment(Request $request, PaymentAllocation $allocation, PaymentReversalService $service): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);
        Gate::authorize('update', $allocation);
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'idempotency_key' => ['nullable', 'string', 'max:191'],
        ]);

        try {
            $reversal = $service->reverse((int) $user->id, $allocation, (string) $data['amount'], $data['idempotency_key'] ?? null);
            return response()->json(['data' => $reversal], 201);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }
}
