<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payment_reversal_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reversal_operation_id')->constrained('operations', indexName: 'pra_reversal_operation_fk')->restrictOnDelete();
            $table->foreignId('original_payment_allocation_id')->constrained('payment_allocations', indexName: 'pra_original_allocation_fk')->restrictOnDelete();
            $table->foreignId('account_reversal_entry_id')->constrained('financial_entries', indexName: 'pra_account_reversal_fk')->restrictOnDelete();
            $table->foreignId('invoice_reversal_entry_id')->constrained('financial_entries', indexName: 'pra_invoice_reversal_fk')->restrictOnDelete();
            $table->decimal('amount', 19, 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_reversal_allocations');
    }
};
