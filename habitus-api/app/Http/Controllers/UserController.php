<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignupRequest;
use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Models\PatientProfile;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        if (Auth::check() && Auth::user()->rol === 'patient') {
            // Si el usuario es un paciente, mandamos directiva
            // 403, sin permisos con un mensaje.
            return response()->json([
                'message' => 'No tienes permiso.'
            ], 403);
        }

        // Filtrar por rol si se proporciona
        $role = request()->query('role');

        // Construir la consulta base
        $query = User::query();

        if ($role) {
            // Si se especifica un rol, filtrar por ese rol
            $query->where('rol', $role);

            // Si es paciente, cargar relaciones con eager loading
            if ($role === 'patient') {
                $query->with('patientProfile.psychologist');
            }
        } elseif (Auth::check() && Auth::user()->rol === 'psychologist') {
            // los psicologos solo podrán ver a los pacientes
            $query->where('rol', 'patient')->with('patientProfile.psychologist');
        }

        // Ejecutar la consulta
        $users = $query->get();

        // devolvemos todos los usuarios y controlamos las peticiones http
        // 200 -> leer
        return response()->json($users, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SignupRequest $request)
    {

        if (Auth::check() && Auth::user()->rol === 'patient') {
            // validamos que si el usuario es paciente, no pueda
            // crear usuarios.
            return response()->json([
                'message' => 'No tienes permiso.',
            ], 403);
        }
        // este $request->validated() valida directaemnte
        // todos los atributos del request.
        $data = $request->validated();

        // creamos el usuario y lo guardamos en la bbdd,
        // esto es posible gracias a no hacer todos los request
        $user = User::create($data);

        // Si es un paciente, guardamos también su perfil
        if ($user->rol === 'patient') {
            $profileData = $request->only([
                'birth_date',
                'profession',
                'marital_status',
                'emergency_phone',
                'address',
                'city',
                'postal_code',
                'consultation_reason',
                'psychologist_id',
            ]);

            $profileData['user_id'] = $user->id;
            PatientProfile::create($profileData);
        }

        // Cargar la relación del perfil
        $user->load('patientProfile');

        // creamos el usuario y envamos un mensaje de confirmación
        // 201 -> crear
        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data'    => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        if( Auth::check() && Auth::user()->rol === 'patient' ){
            // Si el usuario es paciente, no tiene acceso al show.
            return response()->json([
                'message' => 'No tienes permiso.'
            ], 403);
        }

        if(Auth::check() && Auth::user()->rol === 'psychologist' && $user->rol !== 'patient'){
            // Si el usuario que esta viendo el psicologo no es paciente, no tiene permiso
            return response()->json([
                'message' => 'No tienes permiso.'
            ], 403);
        }

        // Cargar la relación del perfil si es paciente
        if ($user->rol === 'patient') {
            $user->load('patientProfile.psychologist');
        }

        return response()->json($user, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        if (Auth::check() && Auth::user()->rol === 'patient') {
            // validamos que si el usuario es paciente, no pueda
            // editar usuarios.
            return response()->json([
                'message' => 'No tienes permiso.',
            ], 403);
        }

        // aquí válidamos de nuevo los datos
        $data = $request->validated();

        // y actualizamos directamente con ->update
        $user->update($data);

        // Si es un paciente, actualizamos también su perfil
        if ($user->rol === 'patient') {
            $profileData = $request->only([
                'birth_date',
                'profession',
                'marital_status',
                'emergency_phone',
                'address',
                'city',
                'postal_code',
                'consultation_reason',
                'psychologist_id',
            ]);

            // Filtrar solo los campos que tienen valor
            $profileData = array_filter($profileData, function($value) {
                return $value !== null;
            });

            if ($user->patientProfile) {
                $user->patientProfile->update($profileData);
            } else {
                $profileData['user_id'] = $user->id;
                PatientProfile::create($profileData);
            }
        }

        // Cargar la relación del perfil y del psicólogo asociado
        if ($user->rol === 'patient') {
            $user->load('patientProfile.psychologist');
        }

        // enviamos un mensaje de confirmación con códido HTTP 200 leer
        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'data'    => $user,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        if (Auth::check() && Auth::user()->rol === 'patient') {
            // validamos que si el usuario es paciente, no pueda
            // borrar usuarios.
            return response()->json([
                'message' => 'No tienes permiso.',
            ], 403);
        }
        // boramos el usuario
        $user->delete();

        // enviamos un mensaje de confirmación con códido HTTP 200 leer
        return response()->json([
            'message' => 'Usuario eliminado correctamente.',
        ], 200);
    }
}
