<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignupRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
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

        if (Auth::check() && Auth::user()->rol === 'psychologist') {
            // los psicologos solo podrán ver a los pacientes
            $users = User::where('rol', 'patient')->get();
        } else {
            // Los recepcionistas y administradores lo podrán ver todo
            $users = User::all();
        }

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

        return response()->json($user, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
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
