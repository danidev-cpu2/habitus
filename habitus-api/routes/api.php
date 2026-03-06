<?php

/**
 *
 *
 * @author Taylor Hernández
 * @version 1.0
 *
 * Aquí se registran las rutas de la api. Por cada ruta,
 * crearemos un phpDOC para documentar los endpoints.
 *      (Se sacan del php artisan route:list)
 */

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
Route::apiResource('users', UserController::class);

// La siguiente ruta será la definitiva, pero se mantiene
// comentada hasta finalizar api
/* Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
}); */
