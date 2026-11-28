<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financial_entries', function (Blueprint $table): void {
            // Preserve a standalone index for the user_id foreign key; MySQL may otherwise
            // rely on the wider route index and refuse to drop it during rollback.
            $table->index(['user_id'], 'entries_user_fk_idx');
            $table->index(
                ['user_id', 'account_id', 'state', 'effective_at'],
                'entries_route_user_account_state_date_idx',
            );
        });

        Schema::table('operations', function (Blueprint $table): void {
            $table->index(
                ['user_id', 'state', 'planned_at'],
                'operations_route_user_state_planned_idx',
            );
        });

        Schema::table('card_invoices', function (Blueprint $table): void {
            // Keep a narrow FK support index independent of the route read index.
            $table->index(['user_id'], 'invoices_user_fk_idx');
            $table->index(
                ['user_id', 'due_date'],
                'invoices_route_user_due_idx',
            );
        });

        Schema::table('financial_accounts', function (Blueprint $table): void {
            $table->index(
                ['user_id', 'account_type'],
                'accounts_route_user_type_idx',
            );
        });
    }

    public function down(): void
    {
        Schema::table('financial_entries', function (Blueprint $table): void {
            $table->dropIndex('entries_route_user_account_state_date_idx');
            // entries_user_fk_idx is intentionally retained as the FK support index.
        });

        Schema::table('operations', function (Blueprint $table): void {
            $table->dropIndex('operations_route_user_state_planned_idx');
        });

        Schema::table('card_invoices', function (Blueprint $table): void {
            $table->dropIndex('invoices_route_user_due_idx');
            // invoices_user_fk_idx is intentionally retained as the FK support index.
        });

        Schema::table('financial_accounts', function (Blueprint $table): void {
            $table->dropIndex('accounts_route_user_type_idx');
        });
    }
};
