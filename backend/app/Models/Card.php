<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Card extends Model { protected $fillable=['user_id','name','credit_limit','closing_day','due_day','status']; protected $casts=['credit_limit'=>'decimal:4','closing_day'=>'integer','due_day'=>'integer']; public function user(){return $this->belongsTo(User::class);} public function invoices(){return $this->hasMany(CardInvoice::class);} public function openingBalance(){return $this->hasOne(CardOpeningBalance::class);} }
