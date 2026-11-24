<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('recurrence_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('nature', 16);
            $table->decimal('amount', 19, 4);
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('description', 500)->nullable();
            $table->string('frequency', 16);
            $table->timestamp('first_occurrence_at');
            $table->string('status', 16)->default('ACTIVE');
            $table->timestamp('end_at')->nullable();
            $table->string('idempotency_key', 191)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'idempotency_key'], 'recurrence_schedules_user_idempotency_unique');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurrence_schedules');
    }
};
