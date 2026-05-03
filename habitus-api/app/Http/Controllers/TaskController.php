<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with('users', 'creator')->latest()->paginate(15);
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string',
            'description' => 'nullable|string',
            'priority'    => 'required|in:low,medium,high',
            'due_date'    => 'nullable|date',
            'user_ids'    => 'required|array',
            'user_ids.*'  => 'exists:users,id',
        ]);

        $task = Task::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        $task->users()->sync($validated['user_ids']);

        return response()->json($task->load('users'), 201);
    }

    public function show(Task $task)
    {
        return response()->json($task->load('users', 'creator'), 200);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title'      => 'sometimes|string',
            'priority'   => 'sometimes|in:low,medium,high',
            'due_date'   => 'nullable|date',
            'user_ids'   => 'sometimes|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $task->update($validated);

        if (isset($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }

        return response()->json($task->load('users'), 200);
    }

    public function destroy(Task $task)
    {
        $task->users()->detach();
        $task->delete();
        return response()->json(['message' => 'Task deleted'], 200);
    }

    public function updateStatus(Request $request, Task $task, User $user)
    {
        $request->validate(['status' => 'required|in:pending,in_progress,completed']);

        $task->users()->updateExistingPivot($user->id, [
            'status' => $request->status
        ]);

        return response()->json(['message' => 'Status updated'], 200);
    }
}