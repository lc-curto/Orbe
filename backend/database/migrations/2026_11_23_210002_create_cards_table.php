<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->decimal('credit_limit', 19, 4);
            $table->unsignedTinyInteger('closing_day')->nullable();
            $table->unsignedTinyInteger('due_day')->nullable();
            $table->string('status', 32)->default('ACTIVE');
            $table->timestamps();
            $table->unique(['user_id', 'name'], 'cards_user_name_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
