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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

final class AuthorizationPolicyTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_cannot_open_balance_on_another_users_card(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $card = $this->card($owner->id, 'Cartão privado');
        $invoice = $this->invoice($owner->id, $card->id, '2027-10-01', '2027-10-31');

        Sanctum::actingAs($attacker);
        $this->postJson("/api/cards/{$card->id}/opening-balance", [
            'declared_amount' => '1000.0000',
            'distributions' => [['invoice_id' => $invoice->id, 'amount' => '1000.0000']],
        ])->assertForbidden();
    }

    #[Test]
    public function user_cannot_allocate_payment_belonging_to_another_user(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $owner->id, 'name' => 'Conta privada', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $operation = Operation::query()->create(['user_id' => $owner->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '100.0000']);
        $entry = FinancialEntry::query()->create(['user_id' => $owner->id, 'operation_id' => $operation->id, 'account_id' => $account->id, 'amount' => '100.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);

        Sanctum::actingAs($attacker);
        $this->postJson("/api/operations/{$operation->id}/payment-allocations", [
            'settlement_entry_id' => $entry->id,
            'allocations' => [],
        ])->assertForbidden();
    }

    #[Test]
    public function user_cannot_reverse_another_users_payment_allocation(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $owner->id, 'name' => 'Conta privada reversão', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = $this->card($owner->id, 'Cartão privado reversão');
        $invoice = $this->invoice($owner->id, $card->id, '2027-11-01', '2027-11-30');
        $operation = Operation::query()->create(['user_id' => $owner->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '100.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $owner->id, 'operation_id' => $operation->id, 'account_id' => $account->id, 'amount' => '100.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $obligation = FinancialEntry::query()->create(['user_id' => $owner->id, 'operation_id' => $operation->id, 'invoice_id' => $invoice->id, 'amount' => '100.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $allocation = PaymentAllocation::query()->create(['payment_operation_id' => $operation->id, 'settlement_entry_id' => $settlement->id, 'obligation_entry_id' => $obligation->id, 'amount' => '100.0000']);

        Sanctum::actingAs($attacker);
        $this->postJson("/api/payment-allocations/{$allocation->id}/reversals", ['amount' => '10.0000'])->assertForbidden();
    }

    private function card(int $userId, string $name): Card
    {
        return Card::query()->create(['user_id' => $userId, 'name' => $name, 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
    }

    private function invoice(int $userId, int $cardId, string $start, string $end): CardInvoice
    {
        return CardInvoice::query()->create(['user_id' => $userId, 'card_id' => $cardId, 'period_start' => $start, 'period_end' => $end, 'due_date' => date('Y-m-d', strtotime($end.' +10 days')), 'cycle_state' => 'OPEN']);
    }
}
