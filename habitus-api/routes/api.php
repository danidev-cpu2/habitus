<?php

/**
 *
 *
 * @author Taylor Hernández
 * @version 2.0
 *
 * Aquí se registran las rutas de la api. Por cada ruta,
 * crearemos un phpDOC para documentar los endpoints.
 *      (Se sacan del php artisan route:list)
 */

use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/**                        USERS
 *
 * GET      /api/users          -> UserController@index
 * POST     /api/users          -> UserController@store
 * GET      /api/users/{user}   -> UserController@show
 * PUT      /api/users/{user}   -> UserController@update
 * DELETE   /api/users/{user}   -> UserController@destroy
*
*/
// Se utilizará esta ruta para las pruebas con usuarios
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::apiResource('users', UserController::class);
});

/**                        USERS
 *
 * POST     /api/login          -> LoginController@login
 * POST     /api/logout         -> LoginController@logout (auth required)
*
*/
// Rutas para hacer el loggin
Route::post('/login', [LoginController::class, 'login']);
