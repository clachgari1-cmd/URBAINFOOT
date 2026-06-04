<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'partner_id',
        'total_amount',
        'status', // pending, paid, delivered
        'customer_name',
        'customer_phone',
        'customer_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
