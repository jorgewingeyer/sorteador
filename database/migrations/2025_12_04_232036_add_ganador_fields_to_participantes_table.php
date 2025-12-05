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
        Schema::table('participantes', function (Blueprint $table) {
            // Posición en que salió sorteado (null si no ha ganado, número si ganó)
            $table->unsignedInteger('ganador_en')->nullable()->after('carton_number');

            // Índice para optimizar consultas de participantes disponibles
            $table->index(['sorteo_id', 'ganador_en']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participantes', function (Blueprint $table) {
            $table->dropIndex(['sorteo_id', 'ganador_en']);
            $table->dropColumn('ganador_en');
        });
    }
};
