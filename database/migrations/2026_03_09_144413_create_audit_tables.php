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
        // 1. Logs de Importación
        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sorteo_id')->constrained('sorteos')->cascadeOnDelete();
            $table->string('file_name');
            $table->integer('file_size')->default(0);
            $table->integer('total_rows')->default(0);
            $table->integer('imported_rows')->default(0);
            $table->integer('skipped_rows')->default(0);
            $table->json('error_log')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 2. Auditoría de Sorteos
        Schema::create('sorteo_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instancia_sorteo_id')->constrained('instancias_sorteo')->cascadeOnDelete();
            $table->string('winning_carton_number', 128);
            $table->integer('participants_pool_size');
            $table->integer('execution_time_ms')->default(0);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('snapshot_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sorteo_audits');
        Schema::dropIfExists('import_logs');
    }
};
