<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class BasicOperationsApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_create_account_category_and_realized_expense(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $account = $this->postJson('/api/accounts', ['name' => 'Conta principal', 'account_type' => 'BANK'])->assertCreated()->json('data');
        $category = $this->postJson('/api/categories', ['name' => 'Casa', 'nature' => 'EXPENSE'])->assertCreated()->json('data');
        $response = $this->postJson('/api/expenses', [
            'amount' => '12.5000', 'account_id' => $account['id'], 'category_id' => $category['id'],
            'state' => 'REALIZED', 'effective_at' => '2026-11-24 10:00:00', 'idempotency_key' => 'expense-001',
        ]);
        $response->assertCreated()->assertJsonPath('data.operation_type', 'EXPENSE')->assertJsonCount(1, 'data.entries');
        $this->assertDatabaseHas('financial_entries', ['account_id' => $account['id'], 'effect' => 'DECREASE', 'amount' => '12.5000']);
    }

    #[Test]
    public function pending_income_has_no_destination_or_entry_until_explicit_confirmation(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $category = Category::query()->create(['user_id' => $user->id, 'name' => 'Salário', 'nature' => 'INCOME', 'status' => 'ACTIVE']);
        Sanctum::actingAs($user);
        $pending = $this->postJson('/api/incomes', ['amount' => '1000.0000', 'category_id' => $category->id, 'state' => 'PENDING', 'planned_at' => '2026-12-01 09:00:00'])
            ->assertCreated()->assertJsonPath('data.account_id', null)->assertJsonCount(0, 'data.entries');
        $this->assertDatabaseCount('financial_entries', 0);
        $this->postJson('/api/operations/'.$pending->json('data.id').'/confirm', ['account_id' => $account->id, 'effective_at' => '2026-12-01 09:00:00'])->assertOk();
        $this->assertDatabaseCount('financial_entries', 1);
        $this->assertDatabaseHas('financial_entries', ['account_id' => $account->id, 'effect' => 'INCREASE', 'state' => 'REALIZED']);
    }

    #[Test]
    public function pending_expense_can_be_created_without_account_and_requires_account_when_confirmed(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $category = Category::query()->create(['user_id' => $user->id, 'name' => 'Casa', 'nature' => 'EXPENSE', 'status' => 'ACTIVE']);
        Sanctum::actingAs($user);

        $pending = $this->postJson('/api/expenses', [
            'amount' => '50.0000', 'category_id' => $category->id, 'state' => 'PENDING',
            'planned_at' => '2026-12-02 10:00:00',
        ])->assertCreated()->assertJsonPath('data.account_id', null)->assertJsonCount(0, 'data.entries');

        $this->postJson('/api/operations/'.$pending->json('data.id').'/confirm', [
            'effective_at' => '2026-12-02 10:00:00',
        ])->assertUnprocessable()->assertJsonValidationErrors('account_id');

        $other = User::factory()->create();
        $otherAccount = FinancialAccount::query()->create(['user_id' => $other->id, 'name' => 'Conta alheia', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $this->postJson('/api/operations/'.$pending->json('data.id').'/confirm', [
            'account_id' => $otherAccount->id, 'effective_at' => '2026-12-02 10:00:00',
        ])->assertUnprocessable()->assertJsonValidationErrors('financial');

        $this->assertDatabaseHas('operations', ['id' => $pending->json('data.id'), 'state' => 'PENDING', 'account_id' => null]);
        $this->assertDatabaseCount('financial_entries', 0);

        $this->postJson('/api/operations/'.$pending->json('data.id').'/confirm', [
            'account_id' => $account->id, 'effective_at' => '2026-12-02 10:00:00',
        ])->assertOk()->assertJsonPath('data.account_id', $account->id);
        $this->assertDatabaseHas('financial_entries', ['operation_id' => $pending->json('data.id'), 'account_id' => $account->id, 'effect' => 'DECREASE', 'state' => 'REALIZED']);
    }

    #[Test]
    public function realized_expense_requires_account_before_creation(): void
    {
        $user = User::factory()->create();
        $category = Category::query()->create(['user_id' => $user->id, 'name' => 'Casa', 'nature' => 'EXPENSE', 'status' => 'ACTIVE']);
        Sanctum::actingAs($user);

        $this->postJson('/api/expenses', [
            'amount' => '50.0000', 'category_id' => $category->id, 'state' => 'REALIZED',
            'effective_at' => '2026-12-02 10:00:00',
        ])->assertUnprocessable()->assertJsonValidationErrors('account_id');
        $this->assertDatabaseCount('operations', 0);
        $this->assertDatabaseCount('financial_entries', 0);
    }

    #[Test]
    public function account_and_category_are_isolated_by_user(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $other->id, 'name' => 'Privada', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $category = Category::query()->create(['user_id' => $other->id, 'name' => 'Privada', 'nature' => 'EXPENSE', 'status' => 'ACTIVE']);
        Sanctum::actingAs($user);
        $this->postJson('/api/expenses', ['amount' => '10.0000', 'account_id' => $account->id, 'category_id' => $category->id, 'state' => 'REALIZED', 'effective_at' => '2026-11-24 10:00:00'])->assertStatus(422)->assertJsonValidationErrors('financial');
        $this->assertDatabaseCount('operations', 0);
    }
}
