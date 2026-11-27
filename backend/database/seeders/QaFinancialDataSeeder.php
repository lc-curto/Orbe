<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\FinancialAccount;
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

            foreach ($accounts as $attributes) {
                FinancialAccount::updateOrCreate(
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

            foreach ($categories as $attributes) {
                Category::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'name' => $attributes['name'],
                        'nature' => $attributes['nature'],
                    ],
                    ['status' => $attributes['status']],
                );
            }
        });
    }
}
