<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('recurrence_occurrences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('recurrence_schedule_id')->constrained('recurrence_schedules')->restrictOnDelete();
            $table->timestamp('scheduled_at');
            $table->decimal('amount', 19, 4);
            $table->string('state', 16)->default('PENDING');
            $table->foreignId('operation_id')->nullable()->constrained('operations')->restrictOnDelete();
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('description', 500)->nullable();
            $table->timestamp('effective_at')->nullable();
            $table->timestamps();

            $table->unique(['recurrence_schedule_id', 'scheduled_at'], 'recurrence_occurrences_schedule_date_unique');
            $table->unique('operation_id', 'recurrence_occurrences_operation_unique');
            $table->index(['user_id', 'state', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurrence_occurrences');
    }
};
