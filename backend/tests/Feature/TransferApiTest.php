<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\FinancialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class TransferApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function realized_transfer_creates_one_operation_two_legs_and_two_entries(): void
    {
        $user = User::factory()->create();
        $out = $this->account($user, 'Banco');
        $in = $this->account($user, 'Carteira');
        Sanctum::actingAs($user);
        $response = $this->postJson('/api/transfers', ['amount' => '100.0000', 'idempotency_key' => 'transfer-001', 'legs' => [
            'out' => ['account_id' => $out->id, 'state' => 'REALIZED', 'effective_at' => '2026-11-24 10:00:00'],
            'in' => ['account_id' => $in->id, 'state' => 'REALIZED', 'effective_at' => '2026-11-24 10:00:00'],
        ]]);
        $response->assertCreated()->assertJsonPath('data.operation_type', 'TRANSFER')->assertJsonCount(2, 'data.transfer_legs')->assertJsonCount(2, 'data.entries');
        $this->assertDatabaseCount('operations', 1);
        $this->assertDatabaseHas('financial_entries', ['account_id' => $out->id, 'effect' => 'DECREASE']);
        $this->assertDatabaseHas('financial_entries', ['account_id' => $in->id, 'effect' => 'INCREASE']);
    }

    #[Test]
    public function pending_leg_can_be_confirmed_without_creating_a_duplicate_entry(): void
    {
        $user = User::factory()->create();
        $out = $this->account($user, 'Banco');
        $in = $this->account($user, 'Carteira');
        Sanctum::actingAs($user);
        $response = $this->postJson('/api/transfers', ['amount' => '50.0000', 'legs' => [
            'out' => ['account_id' => $out->id, 'state' => 'REALIZED', 'effective_at' => '2026-11-24 10:00:00'],
            'in' => ['account_id' => $in->id, 'state' => 'PENDING', 'planned_at' => '2026-11-25 10:00:00'],
        ]])->assertCreated();
        $legId = $response->json('data.transfer_legs.1.id');
        $this->assertDatabaseCount('financial_entries', 1);
        $this->postJson('/api/operations/'.$response->json('data.id').'/transfer-legs/'.$legId.'/confirm', ['effective_at' => '2026-11-25 10:00:00'])->assertOk();
        $this->assertDatabaseCount('financial_entries', 2);
    }

    #[Test]
    public function transfer_cannot_use_another_users_account_or_same_account_twice(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $out = $this->account($user, 'Banco');
        $otherAccount = $this->account($other, 'Privada');
        Sanctum::actingAs($user);
        $this->postJson('/api/transfers', ['amount' => '10.0000', 'legs' => [
            'out' => ['account_id' => $out->id, 'state' => 'REALIZED', 'effective_at' => '2026-11-24 10:00:00'],
            'in' => ['account_id' => $otherAccount->id, 'state' => 'REALIZED', 'effective_at' => '2026-11-24 10:00:00'],
        ]])->assertStatus(422)->assertJsonValidationErrors('financial');
        $this->assertDatabaseCount('operations', 0);
    }

    private function account(User $user, string $name): FinancialAccount
    {
        return FinancialAccount::query()->create(['user_id' => $user->id, 'name' => $name, 'account_type' => 'BANK', 'status' => 'ACTIVE']);
    }
}
