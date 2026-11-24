<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PaymentReversalAllocation extends Model { protected $fillable=['reversal_operation_id','original_payment_allocation_id','account_reversal_entry_id','invoice_reversal_entry_id','amount']; protected $casts=['amount'=>'decimal:4']; public function reversalOperation(){return $this->belongsTo(Operation::class,'reversal_operation_id');} public function originalAllocation(){return $this->belongsTo(PaymentAllocation::class,'original_payment_allocation_id');} public function accountReversalEntry(){return $this->belongsTo(FinancialEntry::class,'account_reversal_entry_id');} public function invoiceReversalEntry(){return $this->belongsTo(FinancialEntry::class,'invoice_reversal_entry_id');} }
