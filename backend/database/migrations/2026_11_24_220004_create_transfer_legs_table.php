<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transfer_legs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('operation_id')->constrained('operations')->restrictOnDelete();
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->string('direction', 3);
            $table->string('state', 16);
            $table->decimal('amount', 19, 4);
            $table->timestamp('effective_at')->nullable();
            $table->timestamp('planned_at')->nullable();
            $table->timestamps();
            $table->unique(['operation_id', 'direction'], 'transfer_legs_operation_direction_unique');
            $table->index(['user_id', 'account_id', 'state'], 'transfer_legs_user_account_state_idx');
        });

        DB::statement("ALTER TABLE transfer_legs ADD CONSTRAINT chk_transfer_legs_direction CHECK (direction IN ('OUT', 'IN'))");
        DB::statement("ALTER TABLE transfer_legs ADD CONSTRAINT chk_transfer_legs_state CHECK (state IN ('PENDING', 'REALIZED', 'CANCELLED'))");
        DB::statement("ALTER TABLE transfer_legs ADD CONSTRAINT chk_transfer_legs_amount CHECK (amount > 0)");
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_legs');
    }
};
