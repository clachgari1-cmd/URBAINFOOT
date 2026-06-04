<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Partner extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'access_code',
        'type',
    ];

    protected $hidden = [
        'password',
        'access_code',
        'remember_token',
    ];

    protected $casts = [
        'password'    => 'hashed',
        'access_code' => 'hashed',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function pitches()
    {
        return $this->hasMany(Pitch::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
