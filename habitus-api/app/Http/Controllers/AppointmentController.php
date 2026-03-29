<?php

namespace App\Http\Controllers;

use App\Http\Requests\AppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        if (Auth::check() && Auth::user()->rol === 'admin' || Auth::user()->rol === 'receptionist') {
            // Si el usuario es admin o recepcionista, recogera todas las citas.
            $appointments = Appointment::with(['patient', 'psychologist'])->get();
        } elseif (Auth::check() && Auth::user()->rol === 'psychologist') {
            // Si el usuario es psicologo, solo recogera sus citas.
            $appointments = Appointment::with(['patient', 'psychologist'])
                ->where('psychologist_id', Auth::user()->id)
                ->get();
        } else {
            // Y si el usuario solo es admin, solo recogera sus citas.
            $appointments = Appointment::with(['patient', 'psychologist'])
                ->where('patient_id', Auth::user()->id)
                ->get();
        }

        return response()->json($appointments, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AppointmentRequest $request)
    {
        // Validamos directamente todos los atributos
        $data = $request->validated();

        // Validamos que el ID del Paciente exista
        $patient = User::find($data['patient_id']);

        if (!$patient || $patient->rol !== 'patient') {
            return response()->json([
                'message' => 'El usuario seleccionado como paciente no tiene rol de paciente.',
            ], 422);
        }

        // Validamos que el ID del psiclogo sea un psicologo
        $psychologist = User::find($data['psychologist_id']);

        if ($psychologist->rol !== 'psychologist') {
            return response()->json([
                'message' => 'El usuario seleccionado como psicologo no tiene rol de psicologo.',
            ], 422);
        }

        // Comprobamos si existe una cita en la misma fecha y hora para el psicologo,
        // además de comprobar si, en caso de haber, si está cancelada o no.
        $existingAppointment = Appointment::where('psychologist_id', $data['psychologist_id'])
            ->where('date', $data['date'])
            ->where('hour', $data['hour'])
            ->where('status', '!=', 'canceled')
            ->first();

        // Si existe la cita, error.
        if ($existingAppointment) {
            return response()->json([
                'message' => 'El psicologo ya tiene una cita programada en esa fecha y hora.',
            ], 422);
        }

        // Si no existe, la creamos
        $appointment = Appointment::create($data);

        /**
         * !! importante, esta linea ayuda a tener más información del usuario
         * dado que al front eventualmente necesitará mas información del
         * usuario, no solo el id.
         *
         * Básicamente, de no hacerla, solo se guardaría el ID de los usuarios,
         * mas no los nombres, ni la fecha, y otro tipo de información pertinente.
         */
        $appointment->load(['patient', 'psychologist']);

        return response()->json([
            'data'    => $appointment,
            'message' => 'Cita creada correctamente.',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        // Validamos si la cita que el psicologo quiere ver es suya.
        if (Auth::check() && Auth::user()->rol === 'psychologist' && $appointment->psychologist_id !== Auth::user()->id) {
            return response()->json([
                'message' => 'No tienes permiso para ver esta cita.',
            ], 403);
        }

        // Validamos si la cita que quiere ver el paciente es suya.
        if (Auth::check() && Auth::user()->rol === 'patient' && $appointment->patient_id !== Auth::user()->id) {
            return response()->json([
                'message' => 'No tienes permiso para ver esta cita.',
            ], 403);
        }

        $appointment->load(['patient', 'psychologist']);

        return response()->json([
            'data' => $appointment,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AppointmentRequest $request, Appointment $appointment)
    {
        $data = $request->validated();

        // Si, a la hora de cambiar al paciente, este usuario no es paciente, salta error.
        if (isset($data['patient_id'])) {
            $patient = User::find($data['patient_id']);
            if ($patient->rol !== 'patient') {
                return response()->json([
                    'message' => 'El usuario seleccionado como paciente no tiene rol de paciente.',
                ], 422);
            }
        }

        // Si se cambia de psicologo, y no es psicologo, salta error
        if (isset($data['psychologist_id'])) {
            $psychologist = User::find($data['psychologist_id']);
            if ($psychologist->rol !== 'psychologist') {
                return response()->json([
                    'message' => 'El usuario seleccionado como psicologo no tiene rol de psicologo.',
                ], 422);
            }
        }

        // Si cuando editamos nos dan un nuevo ID de psicologo, lo usamos,
        // si no, mantenemos el original
        $psychologistId = $data['psychologist_id'] ?? $appointment->psychologist_id;

        // Si cuando editamos nos dan una nueva fecha, la usamos,
        // si no, mantenemos la original
        $date = $data['date'] ?? $appointment->date;

        // Si cuando editamos nos dan una hora nueva, la usamos,
        // si no, mantenemos la original.
        $hour = $data['hour'] ?? $appointment->hour;

        // Aquí, entonces, guardamos en una variable la posibilidad de que exista
        // una cita con los nuevos datos enviados.
        $existingAppointment = Appointment::where('psychologist_id', $psychologistId)
            ->where('date', $date)
            ->where('hour', $hour)
            ->where('status', '!=', 'canceled')
            ->where('id', '!=', $appointment->id)
            ->first();

        // Si ya existe, no se puede agendar.
        if ($existingAppointment) {
            return response()->json([
                'message' => 'El psicologo ya tiene una cita programada en esa fecha y hora.',
            ], 422);
        }

        // Si no existe, la guardamos y updateamos.
        $appointment->update($data);
        $appointment->load(['patient', 'psychologist']);

        return response()->json([
            'message' => 'Cita actualizada correctamente.',
            'data'    => $appointment,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {

        // Creamos una excepción por si un usuario quisiera eliminar una cita.
        if (Auth::check() && Auth::user()->rol === 'patient') {
            return response()->json([
                'message' => 'No tienes permiso para eliminar citas.',
            ], 403);
        }

        $appointment->delete();

        return response()->json([
            'message' => 'Cita eliminada correctamente.',
        ], 200);
    }

    // FUNCIONES PERSONALIZADAS

    public function updateStatus(UpdateAppointmentRequest $request, Appointment $appointment)
    {
        $data = $request->validated();

        $appointment->update(['status' => $data['status']]);
        $appointment->load(['patient', 'psychologist']);

        return response()->json([
            'message' => 'Estado de la cita actualizado correctamente.',
            'data'    => $appointment,
        ], 200);
    }
}
