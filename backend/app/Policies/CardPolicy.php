<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Card;
use App\Models\User;

final class CardPolicy
{
    public function view(User $user, Card $card): bool
    {
        return $user->id === $card->user_id;
    }

    public function update(User $user, Card $card): bool
    {
        return $user->id === $card->user_id;
    }
}
