<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Operation;
use App\Models\User;

final class OperationPolicy
{
    public function view(User $user, Operation $operation): bool
    {
        return $user->id === $operation->user_id;
    }

    public function update(User $user, Operation $operation): bool
    {
        return $user->id === $operation->user_id;
    }
}
