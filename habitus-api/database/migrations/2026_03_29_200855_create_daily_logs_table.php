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
        Schema::create('daily_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('hour');
            $table->enum('status', ['entry', 'exit']);

            /**
             * He añadido un índice compuesto por el ID de usuario y el día después de investigar
             * una forma más eficiente para el rendimiento de la api.
             *
             * Dado que las consultas más frecuentes de esta tabla filtrará por el ID del usuario y el día
             * esta linea evitara que la api lea absolutemnte todos los registros de jornada en vano.
             */
            $table->index(['user_id', 'date']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_logs');
    }
};
