<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class RecurrenceOccurrence extends Model
{
    protected $fillable = [
        'user_id', 'recurrence_schedule_id', 'scheduled_at', 'amount', 'state',
        'operation_id', 'account_id', 'category_id', 'description', 'effective_at',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'scheduled_at' => 'datetime',
        'effective_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(RecurrenceSchedule::class, 'recurrence_schedule_id');
    }

    public function operation(): BelongsTo
    {
        return $this->belongsTo(Operation::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
