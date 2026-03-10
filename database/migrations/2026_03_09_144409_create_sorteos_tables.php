<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Sorteos (Padre)
        Schema::create('sorteos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: "Gran Rifa 2026"
            $table->text('descripcion')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Instancias (Hijo)
        Schema::create('instancias_sorteo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sorteo_id')->constrained('sorteos')->cascadeOnDelete();
            $table->string('nombre'); // Ej: "Sorteo del 14/03"
            $table->dateTime('fecha_ejecucion');
            $table->enum('estado', ['pendiente', 'procesada', 'finalizada'])->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instancias_sorteo');
        Schema::dropIfExists('sorteos');
    }
};
