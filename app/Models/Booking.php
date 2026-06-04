<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'pitch_id',
        'start_time',
        'end_time',
        'total_price',
        'status', // pending, confirmed, cancelled
        'customer_name',
        'customer_phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pitch()
    {
        return $this->belongsTo(Pitch::class);
    }
}
