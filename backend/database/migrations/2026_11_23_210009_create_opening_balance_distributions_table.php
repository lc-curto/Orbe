<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('opening_balance_distributions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('opening_balance_id')->constrained('card_opening_balances')->restrictOnDelete();
            $table->foreignId('invoice_id')->constrained('card_invoices')->restrictOnDelete();
            $table->foreignId('obligation_entry_id')->unique()->constrained('financial_entries')->restrictOnDelete();
            $table->decimal('amount', 19, 4);
            $table->timestamps();
            $table->unique(['opening_balance_id', 'invoice_id'], 'opening_balance_invoice_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opening_balance_distributions');
    }
};
