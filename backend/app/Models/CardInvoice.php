<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CardInvoice extends Model { protected $fillable=['user_id','card_id','period_start','period_end','due_date','cycle_state']; protected $casts=['period_start'=>'date','period_end'=>'date','due_date'=>'date']; public function user(){return $this->belongsTo(User::class);} public function card(){return $this->belongsTo(Card::class);} public function entries(){return $this->hasMany(FinancialEntry::class,'invoice_id');} public function purchaseAllocations(){return $this->hasMany(PurchaseAllocation::class,'invoice_id');} }
