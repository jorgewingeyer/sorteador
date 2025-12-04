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
        Schema::create('participantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sorteo_id')->constrained('sorteos')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('dni', 64);
            $table->string('phone', 64)->nullable();
            $table->string('location')->nullable();
            $table->string('province')->nullable();
            $table->string('carton_number', 128)->nullable();
            $table->timestamps();

            $table->index(['sorteo_id', 'dni']);
            $table->index(['sorteo_id', 'carton_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participantes');
    }
};
