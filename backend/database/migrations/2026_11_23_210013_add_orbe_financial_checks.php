<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE cards ADD CONSTRAINT chk_cards_credit_limit CHECK (credit_limit >= 0)");
        DB::statement("ALTER TABLE cards ADD CONSTRAINT chk_cards_closing_day CHECK (closing_day IS NULL OR closing_day BETWEEN 1 AND 31)");
        DB::statement("ALTER TABLE cards ADD CONSTRAINT chk_cards_due_day CHECK (due_day IS NULL OR due_day BETWEEN 1 AND 31)");
        DB::statement("ALTER TABLE card_invoices ADD CONSTRAINT chk_card_invoices_cycle_state CHECK (cycle_state IN ('PLANNED', 'OPEN', 'CLOSED'))");
        DB::statement("ALTER TABLE card_invoices ADD CONSTRAINT chk_card_invoices_period CHECK (period_start <= period_end)");
        DB::statement("ALTER TABLE operations ADD CONSTRAINT chk_operations_amount CHECK (amount > 0)");
        DB::statement("ALTER TABLE purchase_allocations ADD CONSTRAINT chk_purchase_allocations_amount CHECK (amount > 0)");
        DB::statement("ALTER TABLE financial_entries ADD CONSTRAINT chk_financial_entries_amount CHECK (amount > 0)");
        DB::statement("ALTER TABLE financial_entries ADD CONSTRAINT chk_financial_entries_destination CHECK ((account_id IS NOT NULL) + (invoice_id IS NOT NULL) + (debt_id IS NOT NULL) = 1)");
        DB::statement("ALTER TABLE financial_entries ADD CONSTRAINT chk_financial_entries_effect CHECK (effect IN ('INCREASE', 'DECREASE'))");
        DB::statement("ALTER TABLE financial_entries ADD CONSTRAINT chk_financial_entries_state CHECK (state IN ('PENDING', 'REALIZED', 'CANCELLED'))");
        DB::statement("ALTER TABLE card_opening_balances ADD CONSTRAINT chk_card_opening_balances_amount CHECK (declared_amount > 0)");
        DB::statement("ALTER TABLE opening_balance_distributions ADD CONSTRAINT chk_opening_balance_distributions_amount CHECK (amount > 0)");
        DB::statement("ALTER TABLE opening_balance_adjustments ADD CONSTRAINT chk_opening_balance_adjustments_amount CHECK (amount > 0)");
        DB::statement("ALTER TABLE opening_balance_adjustments ADD CONSTRAINT chk_opening_balance_adjustments_type CHECK (adjustment_type IN ('REDISTRIBUTION', 'REVERSAL'))");
        DB::statement("ALTER TABLE payment_allocations ADD CONSTRAINT chk_payment_allocations_amount CHECK (amount > 0)");
        DB::statement("ALTER TABLE payment_reversal_allocations ADD CONSTRAINT chk_payment_reversal_allocations_amount CHECK (amount > 0)");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE payment_reversal_allocations DROP CHECK chk_payment_reversal_allocations_amount');
        DB::statement('ALTER TABLE payment_allocations DROP CHECK chk_payment_allocations_amount');
        DB::statement('ALTER TABLE opening_balance_adjustments DROP CHECK chk_opening_balance_adjustments_type');
        DB::statement('ALTER TABLE opening_balance_adjustments DROP CHECK chk_opening_balance_adjustments_amount');
        DB::statement('ALTER TABLE opening_balance_distributions DROP CHECK chk_opening_balance_distributions_amount');
        DB::statement('ALTER TABLE card_opening_balances DROP CHECK chk_card_opening_balances_amount');
        DB::statement('ALTER TABLE financial_entries DROP CHECK chk_financial_entries_state');
        DB::statement('ALTER TABLE financial_entries DROP CHECK chk_financial_entries_effect');
        DB::statement('ALTER TABLE financial_entries DROP CHECK chk_financial_entries_destination');
        DB::statement('ALTER TABLE financial_entries DROP CHECK chk_financial_entries_amount');
        DB::statement('ALTER TABLE purchase_allocations DROP CHECK chk_purchase_allocations_amount');
        DB::statement('ALTER TABLE operations DROP CHECK chk_operations_amount');
        DB::statement('ALTER TABLE card_invoices DROP CHECK chk_card_invoices_period');
        DB::statement('ALTER TABLE card_invoices DROP CHECK chk_card_invoices_cycle_state');
        DB::statement('ALTER TABLE cards DROP CHECK chk_cards_due_day');
        DB::statement('ALTER TABLE cards DROP CHECK chk_cards_closing_day');
        DB::statement('ALTER TABLE cards DROP CHECK chk_cards_credit_limit');
    }
};
