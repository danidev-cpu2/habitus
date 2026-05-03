<?php

namespace App\Http\Controllers;

use App\Models\ControlList;
use Illuminate\Http\Request;

class ControlListController extends Controller
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
            'assigned_to' => 'required|exists:users,id',
        ]);

        $controlList = ControlList::create([
            'title' => $request->title,
            'description' => $request->description,
            'created_by' => auth()->id(),
            'assigned_to' => $request->assigned_to,
        ]);

        return response()->json($controlList, 201);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
