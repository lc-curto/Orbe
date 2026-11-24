<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_operation_id')->constrained('operations')->restrictOnDelete();
            $table->foreignId('invoice_id')->constrained('card_invoices')->restrictOnDelete();
            $table->decimal('amount', 19, 4);
            $table->timestamps();
            $table->unique(['purchase_operation_id', 'invoice_id'], 'purchase_operation_invoice_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_allocations');
    }
};
