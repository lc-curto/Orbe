<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('operation_id')->constrained('operations')->restrictOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('card_invoices')->restrictOnDelete();
            $table->foreignId('debt_id')->nullable()->constrained('debts')->restrictOnDelete();
            $table->foreignId('purchase_allocation_id')->nullable()->constrained('purchase_allocations')->restrictOnDelete();
            $table->decimal('amount', 19, 4);
            $table->string('effect', 16);
            $table->string('state', 16);
            $table->timestamp('effective_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_entries');
    }
};
