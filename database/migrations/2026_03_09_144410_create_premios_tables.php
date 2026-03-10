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
        // 1. Catálogo de Premios
        Schema::create('premios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('imagen_path')->nullable();
            $table->timestamps();
        });

        // 2. Asignación de Premios a Instancias
        Schema::create('premio_instancia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instancia_sorteo_id')->constrained('instancias_sorteo')->cascadeOnDelete();
            $table->foreignId('premio_id')->constrained('premios')->cascadeOnDelete();
            $table->integer('posicion'); // 1, 2, 3...
            $table->integer('cantidad')->default(1);
            
            $table->unique(['instancia_sorteo_id', 'posicion']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('premio_instancia');
        Schema::dropIfExists('premios');
    }
};
