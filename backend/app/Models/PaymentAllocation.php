<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PaymentAllocation extends Model { protected $fillable=['payment_operation_id','settlement_entry_id','obligation_entry_id','amount']; protected $casts=['amount'=>'decimal:4']; public function paymentOperation(){return $this->belongsTo(Operation::class,'payment_operation_id');} public function settlementEntry(){return $this->belongsTo(FinancialEntry::class,'settlement_entry_id');} public function obligationEntry(){return $this->belongsTo(FinancialEntry::class,'obligation_entry_id');} public function reversals(){return $this->hasMany(PaymentReversalAllocation::class,'original_payment_allocation_id');} }
