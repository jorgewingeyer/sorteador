<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sorteo extends Model
{
    protected $fillable = ['nombre', 'fecha', 'status'];

    protected $casts = [
        'status' => 'boolean',
        'fecha' => 'date',
    ];

    public function participantes()
    {
        return $this->hasMany(Participante::class);
    }

    public function premios()
    {
        return $this->belongsToMany(Premio::class, 'premio_sorteo')
            ->withPivot('posicion')
            ->withTimestamps();
    }
    //
}
