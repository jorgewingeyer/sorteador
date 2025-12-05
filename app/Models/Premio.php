<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Premio extends Model
{
    protected $fillable = ['nombre', 'descripcion'];

    public function sorteos()
    {
        return $this->belongsToMany(Sorteo::class, 'premio_sorteo')
            ->withPivot('posicion')
            ->withTimestamps();
    }
}
