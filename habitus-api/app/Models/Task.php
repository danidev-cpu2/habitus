<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    //Defino los campos que pueden ser rellenados en la tabla tasks
    protected $fillable = ['title', 'description', 'priority', 'due_date', 'created_by'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_user')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}