<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ControlList extends Model
{
    protected $fillable = ['title', 'description', 'created_by', 'assigned_to'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function labors(): HasMany
    {
        return $this->hasMany(Labor::class);
    }
}
