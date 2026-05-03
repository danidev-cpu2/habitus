<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Labor extends Model
{
    protected $fillable = ['title', 'description', 'status', 'control_list_id'];

    public function controlList(): BelongsTo
    {
        return $this->belongsTo(ControlList::class);
    }
}
