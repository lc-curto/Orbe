<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class FinancialAccount extends Model { protected $fillable=['user_id','name','account_type','status']; public function user(){return $this->belongsTo(User::class);} public function entries(){return $this->hasMany(FinancialEntry::class,'account_id');} }
