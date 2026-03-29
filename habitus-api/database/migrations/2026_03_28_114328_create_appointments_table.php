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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            // Relacion con paciente
            $table->foreignId('patient_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Relacion con psicologo
            $table->foreignId('psychologist_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Estado de la cita
            $table->enum('status', ['pending', 'canceled', 'held'])->default('pending');

            // Fecha y hora
            $table->date('date');
            $table->time('hour');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
