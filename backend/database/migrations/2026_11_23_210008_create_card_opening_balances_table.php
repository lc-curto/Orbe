<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('card_opening_balances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('card_id')->constrained('cards')->restrictOnDelete();
            $table->foreignId('operation_id')->unique()->constrained('operations')->restrictOnDelete();
            $table->decimal('declared_amount', 19, 4);
            $table->timestamps();
            $table->unique('card_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_opening_balances');
    }
};
