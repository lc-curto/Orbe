<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\FinancialAccount;
use App\Models\FinancialEntry;
use App\Models\Operation;
use App\Models\PaymentAllocation;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Symfony\Component\Process\Process;
use Tests\TestCase;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;

final class FinancialConcurrencyTest extends TestCase
{
    use DatabaseMigrations;

    #[Test]
    public function concurrent_payments_cannot_over_allocate_one_obligation(): void
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta concorrência', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $card = Card::query()->create(['user_id' => $user->id, 'name' => 'Cartão concorrência', 'credit_limit' => '10000.0000', 'status' => 'ACTIVE']);
        $invoice = CardInvoice::query()->create(['user_id' => $user->id, 'card_id' => $card->id, 'period_start' => '2027-01-01', 'period_end' => '2027-01-31', 'due_date' => '2027-02-10', 'cycle_state' => 'OPEN']);
        $obligationOperation = Operation::query()->create(['user_id' => $user->id, 'operation_type' => 'PURCHASE', 'state' => 'REALIZED', 'amount' => '1000.0000']);
        $obligation = FinancialEntry::query()->create(['user_id' => $user->id, 'operation_id' => $obligationOperation->id, 'invoice_id' => $invoice->id, 'amount' => '1000.0000', 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        [$paymentOne, $settlementOne] = $this->payment($user->id, $account->id, '700.0000');
        [$paymentTwo, $settlementTwo] = $this->payment($user->id, $account->id, '700.0000');

        $barrier = tempnam(sys_get_temp_dir(), 'orbe-concurrency-');
        $worker = base_path('tests/Support/concurrency_worker.php');
        $make = fn (Operation $payment, FinancialEntry $settlement) => new Process([
            PHP_BINARY, $worker, $barrier, (string) $payment->id, (string) $settlement->id, (string) $obligation->id, '700.0000',
        ], base_path(), null, null, 20);
        $first = $make($paymentOne, $settlementOne);
        $second = $make($paymentTwo, $settlementTwo);
        $first->start();
        $second->start();
        usleep(100_000);
        touch($barrier);
        $first->wait();
        $second->wait();
        @unlink($barrier);

        $results = [json_decode($first->getOutput(), true), json_decode($second->getOutput(), true)];
        self::assertSame(1, count(array_filter($results, fn (array $result): bool => ($result['status'] ?? null) === 'accepted')));
        self::assertSame(1, count(array_filter($results, fn (array $result): bool => ($result['status'] ?? null) === 'rejected')));
        self::assertSame('700.0000', (string) PaymentAllocation::query()->where('obligation_entry_id', $obligation->id)->sum('amount'));
    }

    /** @return array{0:Operation,1:FinancialEntry} */
    private function payment(int $userId, int $accountId, string $amount): array
    {
        $payment = Operation::query()->create(['user_id' => $userId, 'operation_type' => 'PAYMENT', 'state' => 'REALIZED', 'amount' => $amount]);
        $settlement = FinancialEntry::query()->create(['user_id' => $userId, 'operation_id' => $payment->id, 'account_id' => $accountId, 'amount' => $amount, 'effect' => 'DECREASE', 'state' => 'REALIZED']);
        return [$payment, $settlement];
    }
}
