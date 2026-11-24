<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('operations', function (Blueprint $table): void {
            $table->foreignId('account_id')->nullable()->after('category_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->string('description', 500)->nullable()->after('operation_type');
        });
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table): void {
            $table->dropForeign(['account_id']);
            $table->dropColumn(['account_id', 'description']);
        });
    }
};
