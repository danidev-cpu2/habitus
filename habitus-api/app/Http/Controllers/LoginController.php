<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    // Inicio de sesión de usuario
    public function login(Request $request)
    {
        // Obtenemos solo las credenciales necesarias
        $credentials = $request->only('email', 'password');
        /*
            Dado que estamos trabajando con una API, lo ideal
            es trabajar con larabel sanctrum en vez de el web guard,
            dado que nuestra API no esta tocando el estado de la web.
            Para esto, guardamos en una nueva variable al usuario
            que se esta intentando loguear.
        */
        $user = User::where('email', $credentials['email'])->first();

        // Entonces, trabajamos las excepciones.
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            // Si el usuario ha introducido mal las credenciales

            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
            // Devolvemo sun mensaje indicándolo, además del estado de la petición.
        }

        if ($user->status === 'inactive') {
            // Si es un usuario que está inactivo

            return response()->json([
                'message' => 'Cuenta inactiva, habla con el administrador.'
            ], 403);
        }

        // Creamos un nuevo token para que se guarde en el cliente
        $token = $user->createToken('auth-token')->plainTextToken;

        // Y logueamos al usuario.
        return response()->json([
            'message' => '¡Bienvenido!',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ], 200);
    }

    // Cerrar sesión
    public function logout(Request $request)
    {
        // Eliminar solo el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => '¡Hasta la vista!',
        ], 200);
    }
}
