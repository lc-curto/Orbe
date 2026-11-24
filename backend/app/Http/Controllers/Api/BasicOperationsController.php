<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Exceptions\FinancialInvariantViolation;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Operation;
use App\Services\BasicOperationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

final class BasicOperationsController extends Controller
{
    public function accounts(Request $request): JsonResponse
    {
        return response()->json(['data' => FinancialAccount::query()->where('user_id', $request->user()->id)->orderBy('name')->get()]);
    }

    public function storeAccount(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'account_type' => ['required', 'in:BANK,CASH,WALLET']]);
        $account = FinancialAccount::query()->create(['user_id' => $request->user()->id, 'name' => $data['name'], 'account_type' => $data['account_type'], 'status' => 'ACTIVE']);
        return response()->json(['data' => $account], 201);
    }

    public function categories(Request $request): JsonResponse
    {
        $query = Category::query()->where('user_id', $request->user()->id)->where('status', 'ACTIVE')->orderBy('name');
        if ($request->filled('nature')) $query->where('nature', $request->string('nature')->toString());
        return response()->json(['data' => $query->get()]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'nature' => ['required', 'in:INCOME,EXPENSE']]);
        $category = Category::query()->create(['user_id' => $request->user()->id, 'name' => $data['name'], 'nature' => $data['nature'], 'status' => 'ACTIVE']);
        return response()->json(['data' => $category], 201);
    }

    public function store(Request $request, BasicOperationService $service, string $nature): JsonResponse
    {
        abort_unless(in_array($nature, ['INCOME', 'EXPENSE'], true), 404);
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'account_id' => ['required', 'integer'],
            'category_id' => ['required', 'integer'],
            'description' => ['nullable', 'string', 'max:500'],
            'state' => ['required', 'in:REALIZED,PENDING'],
            'effective_at' => ['nullable', 'date'],
            'planned_at' => ['nullable', 'date'],
            'idempotency_key' => ['nullable', 'string', 'max:191'],
        ]);
        try {
            $operation = $service->create((int) $request->user()->id, $nature, (string) $data['amount'], (int) $data['account_id'], (int) $data['category_id'], $data['description'] ?? null, $data['state'], $data['effective_at'] ?? null, $data['planned_at'] ?? null, $data['idempotency_key'] ?? null);
            return response()->json(['data' => $operation], 201);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }

    public function confirm(Request $request, Operation $operation, BasicOperationService $service): JsonResponse
    {
        abort_unless($operation->user_id === $request->user()->id, 404);
        $data = $request->validate(['effective_at' => ['required', 'date']]);
        try {
            return response()->json(['data' => $service->confirm((int) $request->user()->id, $operation, $data['effective_at'])]);
        } catch (FinancialInvariantViolation $exception) {
            throw ValidationException::withMessages(['financial' => $exception->getMessage()]);
        }
    }
}
