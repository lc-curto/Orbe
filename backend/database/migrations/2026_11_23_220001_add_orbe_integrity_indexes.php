<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financial_entries', function (Blueprint $table): void {
            $table->index(['operation_id', 'user_id'], 'entries_operation_user_idx');
            $table->index(['invoice_id', 'user_id'], 'entries_invoice_user_idx');
            $table->index(['account_id', 'user_id'], 'entries_account_user_idx');
            $table->index(['debt_id', 'user_id'], 'entries_debt_user_idx');
        });

        Schema::table('card_invoices', function (Blueprint $table): void {
            $table->index(['id', 'user_id'], 'invoices_id_user_idx');
            $table->index(['card_id', 'user_id'], 'invoices_card_user_idx');
        });

        Schema::table('operations', function (Blueprint $table): void {
            $table->index(['id', 'user_id'], 'operations_id_user_idx');
        });

        Schema::table('payment_allocations', function (Blueprint $table): void {
            $table->index(['payment_operation_id', 'settlement_entry_id'], 'payment_operation_entry_idx');
            $table->index(['obligation_entry_id', 'amount'], 'payment_obligation_amount_idx');
        });
    }

    public function down(): void
    {
        // Os índices compostos podem ser utilizados pelo MySQL como suporte
        // às foreign keys. As migrations seguintes removem as tabelas; não
        // removemos estes índices prematuramente durante o rollback.
    }
};
