<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('operations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('operation_type', 48);
            $table->string('state', 32);
            $table->decimal('amount', 19, 4);
            $table->timestamp('effective_at')->nullable();
            $table->timestamp('planned_at')->nullable();
            $table->foreignId('source_operation_id')->nullable()->constrained('operations')->restrictOnDelete();
            $table->string('idempotency_key', 191)->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'idempotency_key'], 'operations_user_idempotency_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operations');
    }
};
