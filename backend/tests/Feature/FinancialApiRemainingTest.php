<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use App\Models\User;
use App\Services\CardOpeningBalanceService;
use App\Services\PaymentAllocationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

final class FinancialApiRemainingTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function authenticated_user_can_create_an_opening_balance_via_api(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão saldo API');
        $invoice = $this->invoice($user->id, $card->id, '2027-07-01', '2027-07-31', 'OPEN');

        Sanctum::actingAs($user);
        $response = $this->postJson("/api/cards/{$card->id}/opening-balance", [
            'declared_amount' => '8000.0000',
            'distributions' => [['invoice_id' => $invoice->id, 'amount' => '3800.0000']],
        ]);

        $response->assertCreated()->assertJsonStructure(['data' => ['id', 'declared_amount', 'distributions']]);
        $this->assertDatabaseHas('card_opening_balances', ['card_id' => $card->id, 'declared_amount' => '8000.0000']);
    }

    #[Test]
    public function authenticated_user_can_allocate_a_payment_via_api(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta API', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = $this->card($user->id, 'Cartão pagamento API');
        $invoice = $this->invoice($user->id, $card->id, '2027-08-01', '2027-08-31', 'OPEN');
        $operation = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '300.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $operation->id, 'account_id' => $account->id, 'amount' => '300.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $operation->id, 'invoice_id' => $invoice->id, 'amount' => '300.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);

        Sanctum::actingAs($user);
        $response = $this->postJson("/api/operations/{$operation->id}/payment-allocations", [
            'settlement_entry_id' => $settlement->id,
            'allocations' => [['obligation_entry_id' => $obligation->id, 'amount' => '300.0000']],
        ]);

        $response->assertCreated()->assertJsonStructure(['data' => ['id', 'entries']]);
        $this->assertDatabaseHas('payment_allocations', ['settlement_entry_id' => $settlement->id, 'obligation_entry_id' => $obligation->id, 'amount' => '300.0000']);
    }

    #[Test]
    public function authenticated_user_can_create_a_partial_reversal_via_api(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta reversão API', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = $this->card($user->id, 'Cartão reversão API');
        $invoice = $this->invoice($user->id, $card->id, '2027-09-01', '2027-09-30', 'OPEN');
        $operation = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '1000.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $operation->id, 'account_id' => $account->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $operation->id, 'invoice_id' => $invoice->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        app(PaymentAllocationService::class)->allocate($operation, $settlement->id, [['obligation_entry_id' => $obligation->id, 'amount' => '1000.0000']]);
        $allocation = PaymentAllocation::query()->firstOrFail();

        Sanctum::actingAs($user);
        $response = $this->postJson("/api/payment-allocations/{$allocation->id}/reversals", [
            'amount' => '300.0000',
            'idempotency_key' => 'api-reversal-001',
        ]);

        $response->assertCreated()->assertJsonStructure(['data' => ['id', 'amount']]);
        $this->assertDatabaseHas('payment_reversal_allocations', ['original_payment_allocation_id' => $allocation->id, 'amount' => '300.0000']);
    }

    #[Test]
    public function unauthenticated_requests_are_rejected(): void
    {
        $response = $this->postJson('/api/purchases', ['amount' => '100.0000', 'allocations' => []]);
        $response->assertUnauthorized();
    }

    private function card(int $userId, string $name): Card
    {
        return Card::query()->create(['user_id' => $userId, 'name' => $name, 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
    }

    private function invoice(int $userId, int $cardId, string $start, string $end, string $state): CardInvoice
    {
        return CardInvoice::query()->create(['user_id' => $userId, 'card_id' => $cardId, 'period_start' => $start, 'period_end' => $end, 'due_date' => date('Y-m-d', strtotime($end.' +10 days')), 'cycle_state' => $state]);
    }
}
