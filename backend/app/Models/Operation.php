<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Operation extends Model
{
    protected $fillable = ['user_id', 'category_id', 'account_id', 'operation_type', 'description', 'state', 'amount', 'effective_at', 'planned_at', 'source_operation_id', 'idempotency_key'];

    protected $casts = ['amount' => 'decimal:4', 'effective_at' => 'datetime', 'planned_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function account() { return $this->belongsTo(FinancialAccount::class); }
    public function source() { return $this->belongsTo(self::class, 'source_operation_id'); }
    public function entries() { return $this->hasMany(FinancialEntry::class); }
}
