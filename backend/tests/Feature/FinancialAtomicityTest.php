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
use App\Services\PurchaseService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

final class FinancialAtomicityTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function failed_opening_balance_rolls_back_operation_and_previous_rows(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão atomicidade');
        $valid = $this->invoice($user->id, $card->id, '2026-10-01', '2026-10-31');
        $foreignUser = User::factory()->create();
        $foreignCard = $this->card($foreignUser->id, 'Cartão externo');
        $foreign = $this->invoice($foreignUser->id, $foreignCard->id, '2026-10-01', '2026-10-31');

        $this->expectException(FinancialInvariantViolation::class);
        try {
            app(CardOpeningBalanceService::class)->create($user->id, $card, '8000.0000', [
                ['invoice_id' => $valid->id, 'amount' => '3000.0000'],
                ['invoice_id' => $foreign->id, 'amount' => '1000.0000'],
            ]);
        } finally {
            self::assertDatabaseCount('operations', 0);
            self::assertDatabaseCount('card_opening_balances', 0);
            self::assertDatabaseCount('financial_entries', 0);
            self::assertDatabaseCount('opening_balance_distributions', 0);
        }
    }

    #[Test]
    public function failed_purchase_rolls_back_the_operation_and_first_allocation(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão compra atomicidade');
        $valid = $this->invoice($user->id, $card->id, '2026-11-01', '2026-11-30');
        $foreignUser = User::factory()->create();
        $foreignCard = $this->card($foreignUser->id, 'Cartão externo compra');
        $foreign = $this->invoice($foreignUser->id, $foreignCard->id, '2026-11-01', '2026-11-30');

        $this->expectException(FinancialInvariantViolation::class);
        try {
            app(PurchaseService::class)->create($user->id, '1000.0000', [
                ['invoice_id' => $valid->id, 'amount' => '600.0000'],
                ['invoice_id' => $foreign->id, 'amount' => '400.0000'],
            ]);
        } finally {
            self::assertDatabaseCount('operations', 0);
            self::assertDatabaseCount('purchase_allocations', 0);
            self::assertDatabaseCount('financial_entries', 0);
        }
    }

    #[Test]
    public function failed_payment_allocation_does_not_leave_a_partial_allocation(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta atomicidade', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = $this->card($user->id, 'Cartão pagamento atomicidade');
        $invoice = $this->invoice($user->id, $card->id, '2026-12-01', '2026-12-31');
        $operation = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => '1000.0000']);
        $settlement = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $operation->id, 'account_id' => $account->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $operation->id, 'invoice_id' => $invoice->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);

        $this->expectException(FinancialInvariantViolation::class);
        try {
            app(PaymentAllocationService::class)->allocate($operation, $settlement->id, [
                ['obligation_entry_id' => $obligation->id, 'amount' => '600.0000'],
                ['obligation_entry_id' => $obligation->id, 'amount' => '400.0000'],
            ]);
        } finally {
            self::assertDatabaseCount('payment_allocations', 0);
        }
    }

    private function card(int $userId, string $name): Card
    {
        return Card::query()->create(['user_id' => $userId, 'name' => $name, 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
    }

    private function invoice(int $userId, int $cardId, string $start, string $end): CardInvoice
    {
        return CardInvoice::query()->create(['user_id' => $userId, 'card_id' => $cardId, 'period_start' => $start, 'period_end' => $end, 'due_date' => date('Y-m-d', strtotime($end.' +10 days')), 'cycle_state' => 'PLANNED']);
    }
}
