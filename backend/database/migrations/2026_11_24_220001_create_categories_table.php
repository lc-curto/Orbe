<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('name', 120);
            $table->string('nature', 16);
            $table->string('status', 16)->default('ACTIVE');
            $table->timestamps();
            $table->unique(['user_id', 'name', 'nature'], 'categories_user_name_nature_unique');
        });

        DB::statement("ALTER TABLE categories ADD CONSTRAINT chk_categories_nature CHECK (nature IN ('INCOME', 'EXPENSE'))");
        DB::statement("ALTER TABLE categories ADD CONSTRAINT chk_categories_status CHECK (status IN ('ACTIVE', 'ARCHIVED'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
