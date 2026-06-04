<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pitch extends Model
{
    protected $fillable = [
        'partner_id',
        'name',
        'type',
        'price_per_hour',
        'city',
        'features',
        'description',
        'image_path',
    ];

    protected $casts = [
        'features' => 'array',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
