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
        Schema::create('participante', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sorteo_id');
            $table->foreign('sorteo_id')->references('id')->on('sorteos');
            $table->string('full_name');
            $table->integer('dni');
            $table->integer('phone');
            $table->string('location');
            $table->string('province');
            $table->integer('carton_number');
            $table->timestamps();
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
