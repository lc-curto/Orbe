<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

final class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_login_and_receive_a_bearer_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret-password')]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'test-device',
        ]);

        $response->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email']]);
        self::assertDatabaseCount('personal_access_tokens', 1);
    }

    #[Test]
    public function invalid_credentials_are_rejected(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret-password')]);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    #[Test]
    public function bearer_token_can_read_and_revoke_current_session(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device');

        $this->withToken($token->plainTextToken)->getJson('/api/auth/me')->assertOk()->assertJsonPath('user.id', $user->id);
        $this->withToken($token->plainTextToken)->postJson('/api/auth/logout')->assertOk();
        self::assertDatabaseCount('personal_access_tokens', 0);

        $this->refreshApplication();
        $this->withToken($token->plainTextToken)->getJson('/api/auth/me')->assertUnauthorized();
    }

    #[Test]
    public function protected_financial_route_requires_a_sanctum_token(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }
}
