<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Creates a predictable, non-destructive dataset for local UI/API QA.
 *
 * Intended for development databases only. It does not create opening-balance
 * entries; balances must be produced by the application's financial engine.
 */
final class QaFinancialDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::firstOrCreate(
                ['email' => 'test@example.com'],
                ['name' => 'Orbe QA', 'password' => 'password'],
            );

            $accounts = [
                ['name' => 'QA — Conta Banco', 'account_type' => 'BANK', 'status' => 'ACTIVE'],
                ['name' => 'QA — Conta Dinheiro', 'account_type' => 'CASH', 'status' => 'ACTIVE'],
                ['name' => 'QA — Conta Encerrada', 'account_type' => 'BANK', 'status' => 'CLOSED'],
            ];

            $accountModels = [];
            foreach ($accounts as $attributes) {
                $accountModels[$attributes['name']] = FinancialAccount::updateOrCreate(
                    ['user_id' => $user->id, 'name' => $attributes['name']],
                    ['account_type' => $attributes['account_type'], 'status' => $attributes['status']],
                );
            }

            $categories = [
                ['name' => 'QA — Alimentação', 'nature' => 'EXPENSE', 'status' => 'ACTIVE'],
                ['name' => 'QA — Transportes', 'nature' => 'EXPENSE', 'status' => 'ACTIVE'],
                ['name' => 'QA — Habitação', 'nature' => 'EXPENSE', 'status' => 'ACTIVE'],
                ['name' => 'QA — Lazer', 'nature' => 'EXPENSE', 'status' => 'ACTIVE'],
                ['name' => 'QA — Salário', 'nature' => 'INCOME', 'status' => 'ACTIVE'],
                ['name' => 'QA — Investimentos', 'nature' => 'INCOME', 'status' => 'ACTIVE'],
                ['name' => 'QA — Outros rendimentos', 'nature' => 'INCOME', 'status' => 'ACTIVE'],
                ['name' => 'QA — Categoria arquivada', 'nature' => 'EXPENSE', 'status' => 'ARCHIVED'],
            ];

            $categoryModels = [];
            foreach ($categories as $attributes) {
                $categoryModels[$attributes['name']] = Category::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'name' => $attributes['name'],
                        'nature' => $attributes['nature'],
                    ],
                    ['status' => $attributes['status']],
                );
            }

            $bank = $accountModels['QA — Conta Banco'];
            $food = $categoryModels['QA — Alimentação'];
            $transport = $categoryModels['QA — Transportes'];
            $salary = $categoryModels['QA — Salário'];

            $opening = $this->upsertOperation($user->id, 'qa:opening-balance:bank', [
                'category_id' => null,
                'account_id' => $bank->id,
                'operation_type' => 'ACCOUNT_OPENING_BALANCE',
                'state' => 'REALIZED',
                'amount' => '1200.0000',
                'description' => 'QA — Saldo inicial banco',
                'effective_at' => now()->startOfMonth()->setTime(9, 0),
                'planned_at' => null,
            ]);
            $this->upsertEntry($user->id, $opening->id, $bank->id, '1200.0000', 'INCREASE', $opening->effective_at);

            $salaryOperation = $this->upsertOperation($user->id, 'qa:realized:salary', [
                'category_id' => $salary->id,
                'account_id' => $bank->id,
                'operation_type' => 'INCOME',
                'state' => 'REALIZED',
                'amount' => '1800.0000',
                'description' => 'QA — Salário recebido',
                'effective_at' => now()->subDays(15)->setTime(10, 0),
                'planned_at' => null,
            ]);
            $this->upsertEntry($user->id, $salaryOperation->id, $bank->id, '1800.0000', 'INCREASE', $salaryOperation->effective_at);

            $fuel = $this->upsertOperation($user->id, 'qa:realized:fuel', [
                'category_id' => $transport->id,
                'account_id' => $bank->id,
                'operation_type' => 'EXPENSE',
                'state' => 'REALIZED',
                'amount' => '45.0000',
                'description' => 'QA — Combustível pago',
                'effective_at' => now()->subDays(3)->setTime(16, 0),
                'planned_at' => null,
            ]);
            $this->upsertEntry($user->id, $fuel->id, $bank->id, '45.0000', 'DECREASE', $fuel->effective_at);

            $overdueDate = now()->subDay()->setTime(12, 0);
            $this->upsertOperation($user->id, 'qa:pending:supermarket-overdue', [
                'category_id' => $food->id,
                'account_id' => $bank->id,
                'operation_type' => 'EXPENSE',
                'state' => 'PENDING',
                'amount' => '100.0000',
                'description' => 'Supermercado',
                'effective_at' => null,
                'planned_at' => $overdueDate,
            ]);

            $this->upsertOperation($user->id, 'qa:pending:rent-future', [
                'category_id' => $categoryModels['QA — Habitação']->id,
                'account_id' => $bank->id,
                'operation_type' => 'EXPENSE',
                'state' => 'PENDING',
                'amount' => '850.0000',
                'description' => 'QA — Renda a pagar',
                'effective_at' => null,
                'planned_at' => now()->addDays(5)->setTime(9, 0),
            ]);

            $this->upsertOperation($user->id, 'qa:pending:salary-future', [
                'category_id' => $salary->id,
                'account_id' => $bank->id,
                'operation_type' => 'INCOME',
                'state' => 'PENDING',
                'amount' => '2200.0000',
                'description' => 'QA — Salário previsto',
                'effective_at' => null,
                'planned_at' => now()->addDays(10)->setTime(9, 0),
            ]);
        });
    }

    /** @param array<string, mixed> $attributes */
    private function upsertOperation(int $userId, string $key, array $attributes): Operation
    {
        $operation = Operation::query()->where('user_id', $userId)->where('idempotency_key', $key)->first();

        if ($operation === null && $attributes['description'] === 'Supermercado') {
            $operation = Operation::query()
                ->where('user_id', $userId)
                ->where('operation_type', 'EXPENSE')
                ->where('state', 'PENDING')
                ->where('description', 'Supermercado')
                ->whereDate('planned_at', now()->subDay()->toDateString())
                ->first();
        }

        if ($operation === null) {
            $operation = new Operation(['user_id' => $userId]);
        }

        $operation->fill(array_merge($attributes, ['user_id' => $userId, 'idempotency_key' => $key]));
        $operation->save();

        return $operation;
    }

    private function upsertEntry(int $userId, int $operationId, int $accountId, string $amount, string $effect, mixed $date): void
    {
        FinancialEntry::query()->updateOrCreate(
            ['user_id' => $userId, 'operation_id' => $operationId, 'effect' => $effect],
            [
                'account_id' => $accountId,
                'amount' => $amount,
                'state' => 'REALIZED',
                'effective_at' => $date,
            ],
        );
    }
}
