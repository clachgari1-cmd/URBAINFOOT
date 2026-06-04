<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'partner_id',
        'name',
        'category',
        'description',
        'price',
        'stock',
        'image_path',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
