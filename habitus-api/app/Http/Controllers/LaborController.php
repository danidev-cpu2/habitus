<?php

namespace App\Http\Controllers;

use App\Models\Labor;
use Illuminate\Http\Request;

class LaborController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'control_list_id' => 'required|exists:control_lists,id',
        ]);

        $labor = Labor::create([
            'title' => $request->title,
            'description' => $request->description,
            'control_list_id' => $request->control_list_id,
        ]);

        return response()->json($labor, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $labor = Labor::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,completed',
        ]);

        $labor->update(['status' => $request->status]);

        return response()->json($labor);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
