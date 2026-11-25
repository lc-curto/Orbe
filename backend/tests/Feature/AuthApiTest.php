<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
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

    #[Test]
    public function user_can_register_and_receive_a_bearer_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Lucas Curto',
            'email' => 'lucas@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ]);

        $response->assertCreated()->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
        self::assertDatabaseHas('users', ['email' => 'lucas@example.com']);
    }

    #[Test]
    public function password_recovery_request_does_not_reveal_unknown_emails(): void
    {
        Notification::fake();

        $this->postJson('/api/auth/forgot-password', ['email' => 'unknown@example.com'])
            ->assertOk()
            ->assertJsonPath('message', 'Se existir uma conta com esse email, enviámos instruções para recuperar a palavra-passe.');

        Notification::assertNothingSent();
    }

    #[Test]
    public function password_can_be_reset_with_a_valid_token(): void
    {
        Notification::fake();
        $user = User::factory()->create(['password' => Hash::make('old-password')]);
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        self::assertTrue(Hash::check('new-password', $user->refresh()->password));
    }
}
