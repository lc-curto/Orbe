<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CardOpeningBalance extends Model { protected $fillable=['user_id','card_id','operation_id','declared_amount']; protected $casts=['declared_amount'=>'decimal:4']; public function user(){return $this->belongsTo(User::class);} public function card(){return $this->belongsTo(Card::class);} public function operation(){return $this->belongsTo(Operation::class);} public function distributions(){return $this->hasMany(OpeningBalanceDistribution::class,'opening_balance_id');} }
