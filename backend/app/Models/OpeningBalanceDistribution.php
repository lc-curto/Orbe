<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OpeningBalanceDistribution extends Model { protected $fillable=['opening_balance_id','invoice_id','obligation_entry_id','amount']; protected $casts=['amount'=>'decimal:4']; public function openingBalance(){return $this->belongsTo(CardOpeningBalance::class,'opening_balance_id');} public function invoice(){return $this->belongsTo(CardInvoice::class);} public function obligationEntry(){return $this->belongsTo(FinancialEntry::class,'obligation_entry_id');} public function adjustments(){return $this->hasMany(OpeningBalanceAdjustment::class,'source_distribution_id');} }
