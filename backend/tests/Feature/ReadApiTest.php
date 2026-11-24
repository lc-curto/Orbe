<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\User;
use App\Services\PaymentAllocationService;
use App\Services\PurchaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class ReadApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function authenticated_user_can_read_only_its_cards_invoices_and_operations(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $card = Card::query()->create([
            'user_id' => $owner->id,
            'name' => 'Cartão principal',
            'credit_limit' => '5000.0000',
            'status' => 'ACTIVE',
        ]);
        CardInvoice::query()->create([
            'user_id' => $owner->id,
            'card_id' => $card->id,
            'period_start' => '2027-01-01',
            'period_end' => '2027-01-31',
            'due_date' => '2027-02-10',
            'cycle_state' => 'OPEN',
        ]);
        Operation::query()->create([
            'user_id' => $owner->id,
            'operation_type' => 'PURCHASE',
            'state' => 'REALIZED',
            'amount' => '125.0000',
            'effective_at' => '2027-01-05 10:00:00',
        ]);

        Card::query()->create([
            'user_id' => $other->id,
            'name' => 'Cartão de outro utilizador',
            'credit_limit' => '9000.0000',
            'status' => 'ACTIVE',
        ]);

        Sanctum::actingAs($owner);

        $this->getJson('/api/cards')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $card->id);

        $this->getJson('/api/invoices')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.card_id', $card->id);

        $this->getJson('/api/operations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.operation_type', 'PURCHASE');
    }

    #[Test]
    public function user_cannot_read_another_users_card(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $card = Card::query()->create([
            'user_id' => $other->id,
            'name' => 'Privado',
            'credit_limit' => '1000.0000',
            'status' => 'ACTIVE',
        ]);

        Sanctum::actingAs($owner);

        $this->getJson("/api/cards/{$card->id}")->assertNotFound();
    }

    #[Test]
    public function unauthenticated_user_cannot_use_read_endpoints(): void
    {
        $this->getJson('/api/cards')->assertUnauthorized();
        $this->getJson('/api/invoices')->assertUnauthorized();
        $this->getJson('/api/operations')->assertUnauthorized();
    }

    #[Test]
    public function invoice_summary_reconstructs_open_amount_from_obligations_payments_and_reversals(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create([
            'user_id' => $user->id,
            'name' => 'Conta resumo',
            'account_type' => 'BANK',
            'status' => 'ACTIVE',
        ]);
        $card = Card::query()->create([
            'user_id' => $user->id,
            'name' => 'Cartão resumo',
            'credit_limit' => '5000.0000',
            'status' => 'ACTIVE',
        ]);
        $invoice = CardInvoice::query()->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'period_start' => '2027-02-01',
            'period_end' => '2027-02-28',
            'due_date' => '2027-03-10',
            'cycle_state' => 'OPEN',
        ]);

        $purchase = app(PurchaseService::class)->create(
            $user->id,
            '1000.0000',
            [['invoice_id' => $invoice->id, 'amount' => '1000.0000']],
        );
        $obligation = $purchase->entries()->firstOrFail();
        $payment = Operation::query()->create([
            'user_id' => $user->id,
            'operation_type' => 'PAYMENT',
            'state' => 'REALIZED',
            'amount' => '300.0000',
        ]);
        $settlement = FinancialEntry::query()->create([
            'user_id' => $user->id,
            'operation_id' => $payment->id,
            'account_id' => $account->id,
            'amount' => '300.0000',
            'effect' => 'DECREASE',
            'state' => 'REALIZED',
        ]);

        app(PaymentAllocationService::class)->allocate($payment, $settlement->id, [[
            'obligation_entry_id' => $obligation->id,
            'amount' => '300.0000',
        ]]);

        Sanctum::actingAs($user);

        $this->getJson('/api/invoices')
            ->assertOk()
            ->assertJsonPath('data.0.summary.obligation_amount', '1000.0000')
            ->assertJsonPath('data.0.summary.paid_amount', '300.0000')
            ->assertJsonPath('data.0.summary.open_amount', '700.0000');

        $this->getJson('/api/cards/'.$card->id)
            ->assertOk()
            ->assertJsonPath('data.summary.used_amount', '700.0000')
            ->assertJsonPath('data.summary.available_amount', '4300.0000');
    }
}
