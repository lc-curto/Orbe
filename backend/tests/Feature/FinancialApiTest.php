<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Card;
use App\Models\CardInvoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

final class FinancialApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function authenticated_user_can_create_a_parcelled_purchase(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão API');
        $first = $this->invoice($user->id, $card->id, '2027-02-01', '2027-02-28', 'OPEN');
        $second = $this->invoice($user->id, $card->id, '2027-03-01', '2027-03-31', 'PLANNED');

        Sanctum::actingAs($user);
        $response = $this->postJson('/api/purchases', [
            'amount' => '1200.0000',
            'idempotency_key' => 'api-purchase-001',
            'allocations' => [
                ['invoice_id' => $first->id, 'amount' => '300.0000'],
                ['invoice_id' => $second->id, 'amount' => '900.0000'],
            ],
        ]);

        $response->assertCreated()->assertJsonStructure(['data' => ['id', 'amount', 'entries']]);
        $this->assertDatabaseCount('operations', 1);
        $this->assertDatabaseCount('financial_entries', 2);
    }

    #[Test]
    public function api_rejects_purchase_when_allocations_do_not_total_the_amount(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão API inválido');
        $invoice = $this->invoice($user->id, $card->id, '2027-04-01', '2027-04-30', 'OPEN');

        Sanctum::actingAs($user);
        $response = $this->postJson('/api/purchases', [
            'amount' => '1000.0000',
            'allocations' => [['invoice_id' => $invoice->id, 'amount' => '999.0000']],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('financial');
        $this->assertDatabaseCount('operations', 0);
    }

    #[Test]
    public function api_does_not_allow_a_user_to_create_a_purchase_on_another_users_invoice(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $otherCard = $this->card($other->id, 'Cartão privado');
        $otherInvoice = $this->invoice($other->id, $otherCard->id, '2027-05-01', '2027-05-31', 'OPEN');

        Sanctum::actingAs($user);
        $response = $this->postJson('/api/purchases', [
            'amount' => '100.0000',
            'allocations' => [['invoice_id' => $otherInvoice->id, 'amount' => '100.0000']],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('financial');
        $this->assertDatabaseCount('operations', 0);
    }

    #[Test]
    public function repeating_api_purchase_with_same_idempotency_key_returns_same_operation(): void
    {
        $user = User::factory()->create();
        $card = $this->card($user->id, 'Cartão idempotência API');
        $invoice = $this->invoice($user->id, $card->id, '2027-06-01', '2027-06-30', 'OPEN');
        $payload = [
            'amount' => '100.0000',
            'idempotency_key' => 'api-purchase-002',
            'allocations' => [['invoice_id' => $invoice->id, 'amount' => '100.0000']],
        ];

        Sanctum::actingAs($user);
        $first = $this->postJson('/api/purchases', $payload)->assertCreated();
        Sanctum::actingAs($user);
        $second = $this->postJson('/api/purchases', $payload)->assertCreated();

        self::assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertDatabaseCount('operations', 1);
        $this->assertDatabaseCount('purchase_allocations', 1);
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
