<?php

namespace App\Http\Controllers;

use App\Http\Requests\DailyLogRequest;
use App\Models\DailyLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DailyLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Excepción para evitar que los pacientes vean los fichajes.
        if (Auth::check() && Auth::user()->rol === 'patient') {
            return response()->json([
                'message' => 'No tienes permiso para ver fichajes.',
            ], 403);
        }

        // Dejamos que el admin pueda ver todos los fichajes
        if (Auth::check() && Auth::user()->rol === 'admin') {
            $logs = DailyLog::with('user')->orderBy('date', 'desc')->orderBy('hour', 'desc')->get();
        } else {
            // Filtramos para que los psicologos y recepcionistas
            // solo vean sus fichajes.
            $logs = DailyLog::with('user')
                ->where('user_id', Auth::check() && Auth::user()->id)
                ->orderBy('date', 'desc')
                ->orderBy('hour', 'desc')
                ->get();
        }

        return response()->json([
            'data' => $logs,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DailyLogRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;

        $log = DailyLog::create($data);
        $log->load('user');

        return response()->json([
            'message' => 'Fichaje registrado correctamente.',
            'data'    => $log,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(DailyLog $dailyLog)
    {
        // Evitamos que los pacientes vean los logs
        if (Auth::check() && Auth::user()->rol === 'patient') {
            return response()->json([
                'message' => 'No tienes permiso para ver fichajes.',
            ], 403);
        }

        // Recepcionistas y psicologos solo pueden ver sus logs.
        if (Auth::check() && Auth::user()->rol !== 'admin' && $dailyLog->user_id !== Auth::user()->id) {
            return response()->json([
                'message' => 'Solo puedes ver tus propios fichajes.',
            ], 403);
        }

        $dailyLog->load('user');

        return response()->json([
            'data' => $dailyLog,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DailyLogRequest $request, DailyLog $dailyLog)
    {
        // Comprobamos que el logs que quiere editar el usuairo
        // coincida con su usuario
        if ($dailyLog->user_id !== Auth::user()->id) {
            return response()->json([
                'message' => 'Solo puedes editar tus propios fichajes.',
            ], 403);
        }


        $data = $request->validated();
        $dailyLog->update($data);
        $dailyLog->load('user');

        return response()->json([
            'message' => 'Fichaje actualizado correctamente.',
            'data'    => $dailyLog,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DailyLog $dailyLog)
    {

        if (Auth::check() && Auth::user()->rol === 'patient') {
            return response()->json([
                'message' => 'No tienes permiso para eliminar fichajes.',
            ], 403);
        }

        if (Auth::check() && Auth::user()->rol !== 'admin' && $dailyLog->user_id !== Auth::user()->id) {
            return response()->json([
                'message' => 'Solo puedes eliminar tus propios fichajes.',
            ], 403);
        }

        $dailyLog->delete();

        return response()->json([
            'message' => 'Fichaje eliminado correctamente.',
        ], 200);
    }
}
