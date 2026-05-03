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

use App\Http\Controllers\TaskController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DailyLogController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ControlListController;
use App\Http\Controllers\LaborController;
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
 * 
 * 
 * * ----------------------------------------------------------------------------------------------------
 *
 * GET       /api/tasks                         -> TaskController@index
 * POST      /api/tasks                         -> TaskController@store
 * GET       /api/tasks/{task}                  -> TaskController@show
 * PUT       /api/tasks/{task}                  -> TaskController@update
 * DELETE    /api/tasks/{task}                  -> TaskController@destroy
 * PATCH     /api/tasks/{task}/users/{user}/status -> TaskController@updateStatus
 * 
 * ----------------------------------------------------------------------------------------------------
 *
 * POST     /api/control-lists                  -> ControlListController@store
 * GET      /api/control-lists                  -> ControlListController@index
 * GET      /api/control-lists/{control_list}   -> ControlListController@show
 * PUT      /api/control-lists/{control_list}   -> ControlListController@update
 * DELETE   /api/control-lists/{control_list}   -> ControlListController@destroy
 * 
 * POST     /api/labors                         -> LaborController@store
 * GET      /api/labors                         -> LaborController@index
 * GET      /api/labors/{labor}                 -> LaborController@show
 * PUT      /api/labors/{labor}                 -> LaborController@update
 * DELETE   /api/labors/{labor}                 -> LaborController@destroy
 * 
 */
// Se utilizará esta ruta para las pruebas con usuarios
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::apiResource('users', UserController::class);
    Route::get('users/{user}/tasks', [UserController::class, 'tasks']);
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('daily-logs', DailyLogController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::patch('tasks/{task}/users/{user}/status', [TaskController::class, 'updateStatus']);
    Route::apiResource('control-lists', ControlListController::class);
    Route::apiResource('labors', LaborController::class);
});

/**                        USERS
 *
 * POST     /api/login          -> LoginController@login
 * POST     /api/logout         -> LoginController@logout (auth required)
 *
 */
// Rutas para hacer el login
Route::post('/login', [LoginController::class, 'login']);
