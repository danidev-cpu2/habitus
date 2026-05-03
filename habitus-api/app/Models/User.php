<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;  // NECESARIO HasApiTokens!!!!

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'surname',
        'email',
        'dni',
        'telephone',
        'rol',
        'status',
        'theme',
        'notifications',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notifications' => 'boolean',
        ];
    }

    // RELACIÓN N:M CON TASKS
    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_user')
            ->withPivot('status')
            ->withTimestamps();
    }

    // Control lists created by this user (psychologist)
    public function createdControlLists(): HasMany
    {
        return $this->hasMany(ControlList::class, 'created_by');
    }

    // Control lists assigned to this user (patient)
    public function assignedControlLists(): HasMany
    {
        return $this->hasMany(ControlList::class, 'assigned_to');
    }
}