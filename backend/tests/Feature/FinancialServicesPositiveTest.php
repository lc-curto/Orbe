<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\CardOpeningBalance;
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

final class FinancialServicesPositiveTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function opening_balance_can_be_distributed_without_consuming_undistributed_exposure(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão saldo');
        $invoice = $this->invoice($user->id, $card->id, '2026-01-01', '2026-01-31');

        $opening = app(CardOpeningBalanceService::class)->create(
            $user->id, $card, '8000.0000',
            [['invoice_id' => $invoice->id, 'amount' => '3800.0000']]
        );

        self::assertSame('8000.0000', (string) $opening->declared_amount);
        self::assertDatabaseHas('opening_balance_distributions', ['opening_balance_id' => $opening->id, 'amount' => '3800.0000']);
        self::assertSame(1, CardOpeningBalance::query()->where('card_id', $card->id)->count());
    }

    #[Test]
    public function purchase_can_be_split_between_future_invoices_without_duplicate_operation_amount(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão compra');
        $first = $this->invoice($user->id, $card->id, '2026-02-01', '2026-02-28');
        $second = $this->invoice($user->id, $card->id, '2026-03-01', '2026-03-31', 'PLANNED');

        $purchase = app(PurchaseService::class)->create($user->id, '1200.0000', [
            ['invoice_id' => $first->id, 'amount' => '300.0000'],
            ['invoice_id' => $second->id, 'amount' => '900.0000'],
        ]);

        self::assertSame('1200.0000', (string) $purchase->amount);
        self::assertSame(2, $purchase->entries()->count());
        self::assertSame('1200.0000', (string) FinancialEntry::query()->where('operation_id', $purchase->id)->sum('amount'));
    }

    #[Test]
    public function payment_and_partial_reversal_preserve_traceability(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = $this->card($user->id, 'Cartão pagamento');
        $invoice = $this->invoice($user->id, $card->id, '2026-04-01', '2026-04-30');
        $payment = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '1000.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $payment->id, 'account_id' => $account->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $payment->id, 'invoice_id' => $invoice->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);

        app(PaymentAllocationService::class)->allocate($payment, $settlement->id, [['obligation_entry_id' => $obligation->id, 'amount' => '1000.0000']]);
        $allocation = PaymentAllocation::query()->firstOrFail();
        $reversal = app(PaymentReversalService::class)->reverse($user->id, $allocation, '300.0000');

        self::assertSame('300.0000', (string) $reversal->amount);
        self::assertDatabaseHas('payment_reversal_allocations', ['original_payment_allocation_id' => $allocation->id, 'amount' => '300.0000']);
        self::assertDatabaseCount('payment_reversal_allocations', 1);
    }

    private function card(int $userId, string $name): Card
    {
        return Card::query()->create(['user_id' => $userId, 'name' => $name, 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
    }

    private function invoice(int $userId, int $cardId, string $start, string $end, string $state = 'OPEN'): CardInvoice
    {
        return CardInvoice::query()->create(['user_id' => $userId, 'card_id' => $cardId, 'period_start' => $start, 'period_end' => $end, 'due_date' => date('Y-m-d', strtotime($end.' +10 days')), 'cycle_state' => $state]);
    }
}
