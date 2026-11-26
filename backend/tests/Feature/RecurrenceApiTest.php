<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\RecurrenceOccurrence;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class RecurrenceApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_creates_and_generates_occurrences_without_financial_entries(): void
    {
        [$user, $account, $category] = $this->context('EXPENSE');
        Sanctum::actingAs($user);

        $schedule = $this->postJson('/api/recurrences', [
            'nature' => 'EXPENSE', 'amount' => '25.0000',
            'category_id' => $category->id, 'frequency' => 'MONTHLY',
            'first_occurrence_at' => '2026-12-01 09:00:00', 'idempotency_key' => 'rent-001',
        ])->assertCreated()->json('data');

        $this->assertDatabaseCount('recurrence_occurrences', 1);
        $this->assertDatabaseHas('recurrence_schedules', ['id' => $schedule['id'], 'account_id' => null]);
        $this->assertDatabaseHas('recurrence_occurrences', ['recurrence_schedule_id' => $schedule['id'], 'account_id' => null, 'state' => 'PENDING']);
        $this->postJson('/api/recurrences/'.$schedule['id'].'/generate', ['until' => '2027-02-01 09:00:00'])
            ->assertOk()->assertJsonCount(3, 'data.occurrences');
        $this->assertDatabaseCount('financial_entries', 0);
    }

    #[Test]
    public function materialization_is_idempotent_and_creates_one_realized_entry(): void
    {
        [$user, $account, $category] = $this->context('INCOME');
        Sanctum::actingAs($user);
        $schedule = $this->createSchedule($account, $category, 'INCOME');
        $occurrence = RecurrenceOccurrence::query()->firstOrFail();

        $this->postJson('/api/recurrence-occurrences/'.$occurrence->id.'/materialize', ['effective_at' => '2026-12-01 10:00:00'])
            ->assertUnprocessable()->assertJsonValidationErrors('account_id');
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrence->id, 'state' => 'PENDING', 'account_id' => null]);

        $payload = ['account_id' => $account->id, 'effective_at' => '2026-12-01 10:00:00'];
        $this->postJson('/api/recurrence-occurrences/'.$occurrence->id.'/materialize', $payload)->assertOk();
        $this->postJson('/api/recurrence-occurrences/'.$occurrence->id.'/materialize', $payload)->assertOk();

        $this->assertDatabaseCount('operations', 1);
        $this->assertDatabaseCount('financial_entries', 1);
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrence->id, 'state' => 'REALIZED']);
        $this->assertNotNull($schedule['id']);
    }

    #[Test]
    public function occurrence_changes_can_be_limited_to_one_or_applied_to_future_pending_occurrences(): void
    {
        [$user, $account, $category] = $this->context('EXPENSE');
        $otherCategory = Category::query()->create(['user_id' => $user->id, 'name' => 'Outra', 'nature' => 'EXPENSE', 'status' => 'ACTIVE']);
        Sanctum::actingAs($user);
        $schedule = $this->createSchedule($account, $category, 'EXPENSE');
        $this->postJson('/api/recurrences/'.$schedule['id'].'/generate', ['until' => '2027-02-01 09:00:00'])->assertOk();
        $occurrences = RecurrenceOccurrence::query()->orderBy('scheduled_at')->get();

        $this->patchJson('/api/recurrence-occurrences/'.$occurrences[0]->id, ['amount' => '30.0000'])
            ->assertOk();
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrences[0]->id, 'amount' => '30.0000']);
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrences[1]->id, 'amount' => '10.0000']);

        $this->patchJson('/api/recurrence-occurrences/'.$occurrences[1]->id.'/and-following', [
            'amount' => '40.0000', 'category_id' => $otherCategory->id,
        ])->assertOk();
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrences[1]->id, 'amount' => '40.0000', 'category_id' => $otherCategory->id]);
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrences[2]->id, 'amount' => '40.0000', 'category_id' => $otherCategory->id]);
    }

    #[Test]
    public function cancellation_is_individual_and_data_isolated_by_user(): void
    {
        [$user, $account, $category] = $this->context('EXPENSE');
        $other = User::factory()->create();
        Sanctum::actingAs($user);
        $schedule = $this->createSchedule($account, $category, 'EXPENSE');
        $occurrence = RecurrenceOccurrence::query()->firstOrFail();

        Sanctum::actingAs($other);
        $this->postJson('/api/recurrence-occurrences/'.$occurrence->id.'/cancel')->assertNotFound();
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrence->id, 'state' => 'PENDING']);

        Sanctum::actingAs($user);
        $this->postJson('/api/recurrence-occurrences/'.$occurrence->id.'/cancel')->assertOk();
        $this->assertDatabaseHas('recurrence_schedules', ['id' => $schedule['id'], 'status' => 'ACTIVE']);
        $this->assertDatabaseHas('recurrence_occurrences', ['id' => $occurrence->id, 'state' => 'CANCELLED']);
    }

    private function context(string $nature): array
    {
        $user = User::factory()->create();
        $account = FinancialAccount::query()->create(['user_id' => $user->id, 'name' => 'Conta', 'account_type' => 'BANK', 'status' => 'ACTIVE']);
        $category = Category::query()->create(['user_id' => $user->id, 'name' => 'Categoria', 'nature' => $nature, 'status' => 'ACTIVE']);
        return [$user, $account, $category];
    }

    private function createSchedule(FinancialAccount $account, Category $category, string $nature): array
    {
        return $this->postJson('/api/recurrences', [
            'nature' => $nature, 'amount' => '10.0000',
            'category_id' => $category->id, 'frequency' => 'MONTHLY',
            'first_occurrence_at' => '2026-12-01 09:00:00',
        ])->assertCreated()->json('data');
    }
}
