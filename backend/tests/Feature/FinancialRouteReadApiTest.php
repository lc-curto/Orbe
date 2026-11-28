<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class FinancialRouteReadApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-27 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    #[Test]
    public function pending_operation_planned_for_reference_date_is_included_in_same_day_balance(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $account = $this->account($user);
        $this->openingBalance($user, $account, '1000.0000', '2026-11-01 12:00:00');
        $this->operation($user, 'EXPENSE', 'PENDING', '100.0000', null, '2026-11-27 12:00:00', 'Supermercado');

        $this->getJson('/api/financial-route?month=2026-11')
            ->assertOk()
            ->assertJsonPath('data.reference_date', '2026-11-27')
            ->assertJsonPath('data.reference_balance', '1000.0000')
            ->assertJsonPath('data.months.0.days.26.expenses', '100.0000')
            ->assertJsonPath('data.months.0.days.26.balance', '900.0000')
            ->assertJsonPath('data.months.0.ending_balance', '900.0000')
            ->assertJsonPath('data.months.1.opening_balance', '900.0000');
    }

    #[Test]
    public function pending_flows_accumulate_and_carry_balance_across_months(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $account = $this->account($user);
        $this->openingBalance($user, $account, '1000.0000', '2026-11-01 12:00:00');
        $this->operation($user, 'EXPENSE', 'PENDING', '100.0000', null, '2026-11-30 12:00:00', 'Gasto novembro');
        $this->operation($user, 'INCOME', 'PENDING', '250.0000', null, '2026-12-01 12:00:00', 'Ganho dezembro');

        $this->getJson('/api/financial-route?month=2026-11')
            ->assertOk()
            ->assertJsonCount(24, 'data.months')
            ->assertJsonPath('data.months.23.month', '2028-10')
            ->assertJsonPath('data.reference_balance', '1000.0000')
            ->assertJsonPath('data.months.0.days.29.balance', '900.0000')
            ->assertJsonPath('data.months.0.ending_balance', '900.0000')
            ->assertJsonPath('data.months.1.opening_balance', '900.0000')
            ->assertJsonPath('data.months.1.days.0.balance', '1150.0000');
    }

    #[Test]
    public function realized_effects_in_reference_balance_are_not_applied_again(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $account = $this->account($user);
        $this->openingBalance($user, $account, '1000.0000', '2026-11-01 12:00:00');
        $expense = $this->operation($user, 'EXPENSE', 'REALIZED', '200.0000', '2026-11-25 12:00:00');
        $this->entry($user, $expense, $account, '200.0000', 'DECREASE', '2026-11-25 12:00:00');

        $this->getJson('/api/financial-route?month=2026-11')
            ->assertOk()
            ->assertJsonPath('data.reference_balance', '800.0000')
            ->assertJsonPath('data.months.0.days.26.balance', '800.0000')
            ->assertJsonPath('data.months.0.days.24.balance', '800.0000')
            ->assertJsonPath('data.months.0.days.23.balance', '1000.0000');
    }

    #[Test]
    public function card_invoice_is_projected_once_on_its_due_date_not_on_purchase_date(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $account = $this->account($user);
        $this->openingBalance($user, $account, '1000.0000', '2026-11-01 12:00:00');
        $card = Card::query()->create([
            'user_id' => $user->id,
            'name' => 'Cartão principal',
            'credit_limit' => '5000.0000',
            'status' => 'ACTIVE',
        ]);
        $invoice = CardInvoice::query()->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'period_start' => '2026-11-01',
            'period_end' => '2026-11-30',
            'due_date' => '2026-12-05',
            'cycle_state' => 'CLOSED',
        ]);
        $purchase = $this->operation($user, 'PURCHASE', 'REALIZED', '150.0000', '2026-11-20 12:00:00');
        FinancialEntry::query()->create([
            'user_id' => $user->id,
            'operation_id' => $purchase->id,
            'invoice_id' => $invoice->id,
            'amount' => '150.0000',
            'effect' => 'DECREASE',
            'state' => 'REALIZED',
            'effective_at' => '2026-11-20 12:00:00',
        ]);

        $this->getJson('/api/financial-route?month=2026-11')
            ->assertOk()
            ->assertJsonPath('data.months.0.days.19.expenses', '0.0000')
            ->assertJsonPath('data.months.1.days.4.expenses', '150.0000')
            ->assertJsonPath('data.months.1.days.4.invoice_ids.0', $invoice->id)
            ->assertJsonPath('data.months.1.days.4.balance', '850.0000');
    }

    #[Test]
    public function overdue_pending_items_are_not_automatically_rescheduled(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $account = $this->account($user);
        $this->openingBalance($user, $account, '1000.0000', '2026-11-01 12:00:00');
        $this->operation($user, 'EXPENSE', 'PENDING', '50.0000', null, '2026-11-20 12:00:00', 'Pendente vencido');
        $card = Card::query()->create([
            'user_id' => $user->id,
            'name' => 'Cartão vencido',
            'credit_limit' => '1000.0000',
            'status' => 'ACTIVE',
        ]);
        CardInvoice::query()->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'due_date' => '2026-11-20',
            'cycle_state' => 'CLOSED',
        ]);
        $purchase = $this->operation($user, 'PURCHASE', 'REALIZED', '100.0000', '2026-10-20 12:00:00');
        $invoice = CardInvoice::query()->where('card_id', $card->id)->firstOrFail();
        FinancialEntry::query()->create([
            'user_id' => $user->id,
            'operation_id' => $purchase->id,
            'invoice_id' => $invoice->id,
            'amount' => '100.0000',
            'effect' => 'DECREASE',
            'state' => 'REALIZED',
            'effective_at' => '2026-10-20 12:00:00',
        ]);

        $this->getJson('/api/financial-route?month=2026-11')
            ->assertOk()
            ->assertJsonPath('data.months.0.days.19.expenses', '0.0000')
            ->assertJsonPath('data.months.0.days.26.balance', '1000.0000')
            ->assertJsonPath('data.overdue_total', '150.0000')
            ->assertJsonCount(2, 'data.overdue_items');
    }

    #[Test]
    public function transfers_are_visible_in_detail_but_do_not_change_route_cash_flow_or_total_balance(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $bank = $this->account($user, 'BANK');
        $cash = $this->account($user, 'CASH');
        $this->openingBalance($user, $bank, '1000.0000', '2026-11-01 12:00:00');
        $transfer = $this->operation($user, 'TRANSFER', 'REALIZED', '200.0000', '2026-11-26 12:00:00');
        $this->entry($user, $transfer, $bank, '200.0000', 'DECREASE', '2026-11-26 12:00:00');
        $this->entry($user, $transfer, $cash, '200.0000', 'INCREASE', '2026-11-26 12:00:00');

        $this->getJson('/api/financial-route?month=2026-11')
            ->assertOk()
            ->assertJsonPath('data.reference_balance', '1000.0000')
            ->assertJsonPath('data.months.0.days.25.income', '0.0000')
            ->assertJsonPath('data.months.0.days.25.expenses', '0.0000')
            ->assertJsonPath('data.months.0.days.26.balance', '1000.0000')
            ->assertJsonPath('data.months.0.days.25.operation_ids.0', $transfer->id);
    }

    #[Test]
    public function invalid_realized_entry_date_makes_balance_unavailable_instead_of_guessing(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $account = $this->account($user);
        $operation = $this->operation($user, 'EXPENSE', 'REALIZED', '10.0000', null);
        $this->entry($user, $operation, $account, '10.0000', 'DECREASE', null);

        $this->getJson('/api/financial-route?month=2026-11')
            ->assertOk()
            ->assertJsonPath('data.reference_balance', null)
            ->assertJsonPath('data.months.0.days.26.balance', null);
    }

    #[Test]
    public function route_read_model_is_private_and_requires_a_valid_month(): void
    {
        $this->getJson('/api/financial-route?month=2026-11')->assertUnauthorized();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/financial-route?month=2026-13')->assertUnprocessable();
        $this->getJson('/api/financial-route?month=2026-11&months=25')->assertUnprocessable();
        $this->getJson('/api/financial-route?month=2026-11&months=1')
            ->assertOk()
            ->assertJsonCount(1, 'data.months')
            ->assertJsonPath('data.months.0.month', '2026-11');
        $this->getJson('/api/financial-route?month=2026-11&months=6')
            ->assertOk()
            ->assertJsonCount(6, 'data.months')
            ->assertJsonPath('data.months.5.month', '2027-04');
        $this->getJson('/api/financial-route?month=2026-11')->assertOk()->assertJsonCount(24, 'data.months');
    }

    private function account(User $user, string $type = 'BANK'): FinancialAccount
    {
        return FinancialAccount::query()->create([
            'user_id' => $user->id,
            'name' => 'Conta '.$type,
            'account_type' => $type,
            'status' => 'ACTIVE',
        ]);
    }

    private function openingBalance(User $user, FinancialAccount $account, string $amount, string $date): void
    {
        $operation = $this->operation($user, 'ACCOUNT_OPENING_BALANCE', 'REALIZED', $amount, $date);
        $this->entry($user, $operation, $account, $amount, 'INCREASE', $date);
    }

    private function operation(User $user, string $type, string $state, string $amount, ?string $effectiveAt, ?string $plannedAt = null, ?string $description = null): Operation
    {
        return Operation::query()->create([
            'user_id' => $user->id,
            'operation_type' => $type,
            'state' => $state,
            'amount' => $amount,
            'effective_at' => $effectiveAt,
            'planned_at' => $plannedAt,
            'description' => $description,
        ]);
    }

    private function entry(User $user, Operation $operation, FinancialAccount $account, string $amount, string $effect, ?string $date): FinancialEntry
    {
        return FinancialEntry::query()->create([
            'user_id' => $user->id,
            'operation_id' => $operation->id,
            'account_id' => $account->id,
            'amount' => $amount,
            'effect' => $effect,
            'state' => 'REALIZED',
            'effective_at' => $date,
        ]);
    }
}
