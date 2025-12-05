<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('premio_sorteo');
        Schema::create('premio_sorteo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sorteo_id')->constrained()->cascadeOnDelete();
            $table->foreignId('premio_id')->constrained()->cascadeOnDelete();
            $table->integer('posicion');

            $table->unique(['sorteo_id', 'posicion']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('premio_sorteo');
    }
};
