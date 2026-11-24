<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class FinancialEntry extends Model { protected $fillable=['user_id','operation_id','account_id','invoice_id','debt_id','purchase_allocation_id','amount','effect','state','effective_at']; protected $casts=['amount'=>'decimal:4','effective_at'=>'datetime']; public function user(){return $this->belongsTo(User::class);} public function operation(){return $this->belongsTo(Operation::class);} public function account(){return $this->belongsTo(FinancialAccount::class);} public function invoice(){return $this->belongsTo(CardInvoice::class);} public function debt(){return $this->belongsTo(Debt::class);} public function purchaseAllocation(){return $this->belongsTo(PurchaseAllocation::class);} }
