<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PurchaseAllocation extends Model { protected $fillable=['purchase_operation_id','invoice_id','amount']; protected $casts=['amount'=>'decimal:4']; public function operation(){return $this->belongsTo(Operation::class,'purchase_operation_id');} public function invoice(){return $this->belongsTo(CardInvoice::class);} public function entries(){return $this->hasMany(FinancialEntry::class,'purchase_allocation_id');} }
