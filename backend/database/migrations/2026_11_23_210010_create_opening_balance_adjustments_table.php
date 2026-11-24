<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('opening_balance_adjustments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('source_distribution_id')->constrained('opening_balance_distributions', indexName: 'oba_source_distribution_fk')->restrictOnDelete();
            $table->foreignId('correction_operation_id')->constrained('operations', indexName: 'oba_correction_operation_fk')->restrictOnDelete();
            $table->string('adjustment_type', 24);
            $table->foreignId('source_reduction_entry_id')->constrained('financial_entries', indexName: 'oba_source_reduction_fk')->restrictOnDelete();
            $table->foreignId('destination_increase_entry_id')->constrained('financial_entries', indexName: 'oba_destination_increase_fk')->restrictOnDelete();
            $table->foreignId('reverses_adjustment_id')->nullable()->constrained('opening_balance_adjustments', indexName: 'oba_reverses_adjustment_fk')->restrictOnDelete();
            $table->decimal('amount', 19, 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opening_balance_adjustments');
    }
};
