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

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DailyLogController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/**                        USERS
 *
 * GET      /api/users                          -> UserController@index
 * POST     /api/users                          -> UserController@store
 * GET      /api/users/{user}                   -> UserController@show
 * PUT      /api/users/{user}                   -> UserController@update
 * DELETE   /api/users/{user}                   -> UserController@destroy
 *
 * ----------------------------------------------------------------------------------------------------
 *
 * GET      /api/appointments                   -› AppointmentController@index
 * POST     /api/appointments                   -> AppointmentController@store
 * GET      /api/appointments/{appointment}     -> AppointmentController@show
 * PUT      /api/appointments/{appointment}     -> AppointmentController@update
 * DELETE   /api/appointments/{appointment}     -> AppointmentController@destroy
 *
 * ----------------------------------------------------------------------------------------------------
 *
 * GET       /api/daily-logs                    -› DailyLogController@index
 * POST      /api/daily-logs                    -› DailyLogController@store
 * GET       /api/daily-logs/{daily_log}        -› DailyLogController@show
 * PUT       /api/daily-logs/{daily_log}        -› DailyLogController@update
 * DELETE    /api/daily-logs/{daily_log}        -› DailyLogController@destroy
 */
// Se utilizará esta ruta para las pruebas con usuarios
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::apiResource('users', UserController::class);
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('daily-logs', DailyLogController::class);
});

/**                        USERS
 *
 * POST     /api/login          -> LoginController@login
 * POST     /api/logout         -> LoginController@logout (auth required)
 *
 */
// Rutas para hacer el login
Route::post('/login', [LoginController::class, 'login']);
