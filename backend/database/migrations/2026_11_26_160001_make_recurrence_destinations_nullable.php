<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recurrence_schedules', function (Blueprint $table): void {
            $table->unsignedBigInteger('account_id')->nullable()->change();
        });

        Schema::table('recurrence_occurrences', function (Blueprint $table): void {
            $table->unsignedBigInteger('account_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::table('recurrence_schedules')->whereNull('account_id')->exists()
            || DB::table('recurrence_occurrences')->whereNull('account_id')->exists()) {
            throw new RuntimeException('Não é possível reverter: existem programações ou ocorrências sem destino financeiro.');
        }

        Schema::table('recurrence_occurrences', function (Blueprint $table): void {
            $table->unsignedBigInteger('account_id')->nullable(false)->change();
        });

        Schema::table('recurrence_schedules', function (Blueprint $table): void {
            $table->unsignedBigInteger('account_id')->nullable(false)->change();
        });
    }
};
