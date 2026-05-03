<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    // Definimos los atributos de esta manera parapoder utilizar
    // las funciones de create() y update()
    protected $fillable = [
        'patient_id',
        'psychologist_id',
        'status',
        'date',
        'hour',
    ];

    // Al hacer esto convertimos date en un objeto tipo fecha,
    // más fácil de manejar.
    protected $casts = [
        'date' => 'date',
    ];

    // Una cita pertenece a un paciente.
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    // Una cita pertenece a un psicologo.
    public function psychologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }
}
