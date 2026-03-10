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
        // 1. Inscriptos (Carga Incremental)
        Schema::create('inscriptos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sorteo_id')->constrained('sorteos')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('dni', 64);
            $table->string('carton_number', 128);
            $table->string('phone', 64)->nullable();
            $table->string('location')->nullable();
            $table->string('province')->nullable();
            $table->timestamps();

            // Evitar duplicar exactamente el mismo registro en la carga
            $table->unique(['sorteo_id', 'dni', 'carton_number']);
            // Índice para búsquedas rápidas por cartón
            $table->index(['sorteo_id', 'carton_number']);
        });

        // 2. Participantes Sorteo (Limpio y Deduplicado por Instancia)
        Schema::create('participantes_sorteo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instancia_sorteo_id')->constrained('instancias_sorteo')->cascadeOnDelete();
            $table->string('carton_number', 128);
            $table->timestamp('procesado_en')->useCurrent();

            // Solo un cartón único por instancia
            $table->unique(['instancia_sorteo_id', 'carton_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participantes_sorteo');
        Schema::dropIfExists('inscriptos');
    }
};
