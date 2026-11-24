<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TransferLeg extends Model
{
    protected $fillable = ['user_id', 'operation_id', 'account_id', 'direction', 'state', 'amount', 'effective_at', 'planned_at'];

    protected $casts = ['amount' => 'decimal:4', 'effective_at' => 'datetime', 'planned_at' => 'datetime'];

    public function operation(): BelongsTo { return $this->belongsTo(Operation::class); }
    public function account(): BelongsTo { return $this->belongsTo(FinancialAccount::class); }
}
