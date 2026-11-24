<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\CardOpeningBalance;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use App\Services\CardOpeningBalanceService;
use App\Services\PaymentReversalService;
use App\Services\PurchaseService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

final class FinancialServicesTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function opening_balance_cannot_exceed_declared_amount(): void
    {
        $user = User::factory()->create();
        $card = Card::query()->create(['user_id' => $user->id, 'name' => 'Cartão', 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
        $invoice = $this->invoice($user->id, $card->id);

        $this->expectException(FinancialInvariantViolation::class);
        app(CardOpeningBalanceService::class)->create($user->id, $card, '8000.0000', [['invoice_id' => $invoice->id, 'amount' => '8000.0001']]);
        self::assertDatabaseCount('card_opening_balances', 0);
    }

    #[Test]
    public function purchase_allocations_must_equal_purchase_amount(): void
    {
        $user = User::factory()->create();
        $card = Card::query()->create(['user_id' => $user->id, 'name' => 'Cartão', 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
        $invoice = $this->invoice($user->id, $card->id);

        $this->expectException(FinancialInvariantViolation::class);
        app(PurchaseService::class)->create($user->id, '1200.0000', [['invoice_id' => $invoice->id, 'amount' => '1199.9900']]);
        self::assertDatabaseCount('operations', 0);
    }

    #[Test]
    public function payment_reversal_cannot_exceed_original_allocation(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = Card::query()->create(['user_id' => $user->id, 'name' => 'Cartão', 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
        $invoice = $this->invoice($user->id, $card->id);
        $payment = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '300.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $payment->id, 'account_id' => $account->id, 'amount' => '300.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $payment->id, 'invoice_id' => $invoice->id, 'amount' => '300.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $allocation = PaymentAllocation::query()->create(['payment_operation_id' => $payment->id, 'settlement_entry_id' => $settlement->id, 'obligation_entry_id' => $obligation->id, 'amount' => '300.0000']);

        $this->expectException(FinancialInvariantViolation::class);
        app(PaymentReversalService::class)->reverse($user->id, $allocation, '300.0001');
        self::assertDatabaseCount('payment_reversal_allocations', 0);
    }

    private function invoice(int $userId, int $cardId): CardInvoice
    {
        return CardInvoice::query()->create(['user_id' => $userId, 'card_id' => $cardId, 'period_start' => '2026-01-01', 'period_end' => '2026-01-31', 'due_date' => '2026-02-10', 'cycle_state' => 'OPEN']);
    }
}
