<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class RecurrenceSchedule extends Model
{
    protected $fillable = [
        'user_id', 'nature', 'amount', 'account_id', 'category_id', 'description',
        'frequency', 'first_occurrence_at', 'status', 'end_at', 'idempotency_key',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'first_occurrence_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function occurrences(): HasMany
    {
        return $this->hasMany(RecurrenceOccurrence::class);
    }
}
