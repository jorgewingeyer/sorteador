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
        // 1. Ganadores (Resultado del Sorteo - Todos los cartones)
        Schema::create('ganadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instancia_sorteo_id')->constrained('instancias_sorteo')->cascadeOnDelete();
            $table->string('carton_number', 128);
            $table->foreignId('premio_instancia_id')->constrained('premio_instancia')->cascadeOnDelete();
            $table->integer('winning_position');
            
            // Referencia al inscripto específico (uno de los posibles dueños del cartón)
            $table->foreignId('inscripto_id')->constrained('inscriptos')->cascadeOnDelete();
            
            $table->timestamps();
            
            // Índice para verificar rápidamente si un cartón ya ganó
            $table->index('carton_number');
        });

        // 2. Entregas (Confirmación Administrativa)
        Schema::create('entregas_premios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ganador_id')->unique()->constrained('ganadores')->cascadeOnDelete();
            
            $table->dateTime('fecha_entrega')->useCurrent();
            $table->string('dni_receptor', 64)->nullable();
            $table->string('nombre_receptor')->nullable();
            $table->text('observaciones')->nullable();
            $table->string('foto_evidencia_path')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entregas_premios');
        Schema::dropIfExists('ganadores');
    }
};
