<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Exceptions\FinancialInvariantViolation;
use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use App\Services\CardOpeningBalanceService;
use App\Services\PaymentAllocationService;
use App\Services\PaymentReversalService;
use App\Services\PurchaseService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

final class FinancialIntegrityBoundaryTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function opening_balance_rejects_another_users_invoice(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $card = $this->card($owner->id, 'Cartão do proprietário');
        $foreignCard = $this->card($other->id, 'Cartão de outro utilizador');
        $foreignInvoice = $this->invoice($other->id, $foreignCard->id, '2026-05-01', '2026-05-31');

        $this->expectException(FinancialInvariantViolation::class);
        app(CardOpeningBalanceService::class)->create($owner->id, $card, '8000.0000', [['invoice_id' => $foreignInvoice->id, 'amount' => '1000.0000']]);
    }

    #[Test]
    public function purchase_rejects_another_users_invoice(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $foreignCard = $this->card($other->id, 'Cartão de outro utilizador');
        $foreignInvoice = $this->invoice($other->id, $foreignCard->id, '2026-06-01', '2026-06-30');

        $this->expectException(FinancialInvariantViolation::class);
        app(PurchaseService::class)->create($owner->id, '100.0000', [['invoice_id' => $foreignInvoice->id, 'amount' => '100.0000']]);
    }

    #[Test]
    public function purchase_with_same_idempotency_key_returns_the_original_operation(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão idempotência');
        $invoice = $this->invoice($user->id, $card->id, '2026-07-01', '2026-07-31');
        $service = app(PurchaseService::class);

        $first = $service->create($user->id, '100.0000', [['invoice_id' => $invoice->id, 'amount' => '100.0000']], 'purchase-001');
        $second = $service->create($user->id, '100.0000', [['invoice_id' => $invoice->id, 'amount' => '100.0000']], 'purchase-001');

        self::assertSame($first->id, $second->id);
        self::assertDatabaseCount('operations', 1);
        self::assertDatabaseCount('purchase_allocations', 1);
    }

    #[Test]
    public function accumulated_payment_allocations_cannot_exceed_obligation(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta limite', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = $this->card($user->id, 'Cartão limite');
        $invoice = $this->invoice($user->id, $card->id, '2026-08-01', '2026-08-31');
        $obligationOperation = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PURCHASE', 'state' => 'REALIZED', 'amount' => '1000.0000']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $obligationOperation->id, 'invoice_id' => $invoice->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $payment = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '600.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $payment->id, 'account_id' => $account->id, 'amount' => '600.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        app(PaymentAllocationService::class)->allocate($payment, $settlement->id, [['obligation_entry_id' => $obligation->id, 'amount' => '600.0000']]);

        $secondPayment = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '500.0000']);
        $secondSettlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $secondPayment->id, 'account_id' => $account->id, 'amount' => '500.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);

        $this->expectException(FinancialInvariantViolation::class);
        app(PaymentAllocationService::class)->allocate($secondPayment, $secondSettlement->id, [['obligation_entry_id' => $obligation->id, 'amount' => '500.0000']]);
    }

    #[Test]
    public function accumulated_reversals_cannot_exceed_original_allocation(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta reversão', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = $this->card($user->id, 'Cartão reversão');
        $invoice = $this->invoice($user->id, $card->id, '2026-09-01', '2026-09-30');
        $payment = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '1000.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $payment->id, 'account_id' => $account->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $payment->id, 'invoice_id' => $invoice->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        app(PaymentAllocationService::class)->allocate($payment, $settlement->id, [['obligation_entry_id' => $obligation->id, 'amount' => '1000.0000']]);
        $allocation = PaymentAllocation::query()->firstOrFail();
        app(PaymentReversalService::class)->reverse($user->id, $allocation, '600.0000');

        $this->expectException(FinancialInvariantViolation::class);
        app(PaymentReversalService::class)->reverse($user->id, $allocation, '500.0000');
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
