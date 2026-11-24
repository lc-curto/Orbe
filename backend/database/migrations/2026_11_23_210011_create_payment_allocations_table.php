<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payment_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('payment_operation_id')->constrained('operations')->restrictOnDelete();
            $table->foreignId('settlement_entry_id')->constrained('financial_entries')->restrictOnDelete();
            $table->foreignId('obligation_entry_id')->constrained('financial_entries')->restrictOnDelete();
            $table->decimal('amount', 19, 4);
            $table->timestamps();
            $table->unique(['settlement_entry_id', 'obligation_entry_id'], 'payment_settlement_obligation_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_allocations');
    }
};
