<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\PaymentAllocation;
use App\Models\User;

final class PaymentAllocationPolicy
{
    public function view(User $user, PaymentAllocation $allocation): bool
    {
        return $allocation->paymentOperation()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, PaymentAllocation $allocation): bool
    {
        return $allocation->paymentOperation()->where('user_id', $user->id)->exists();
    }
}
