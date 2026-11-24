<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('card_invoices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('card_id')->constrained()->restrictOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->date('due_date')->nullable();
            $table->string('cycle_state', 16);
            $table->unsignedBigInteger('open_card_key')->nullable()->storedAs("IF(cycle_state = 'OPEN', card_id, NULL)");
            $table->timestamps();
            $table->unique(['card_id', 'period_start', 'period_end'], 'invoices_card_period_unique');
            $table->unique('open_card_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_invoices');
    }
};
