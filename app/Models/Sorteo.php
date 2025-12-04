<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sorteo extends Model
{
    protected $fillable = ['nombre', 'fecha'];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function participantes()
    {
        return $this->hasMany(Participante::class);
    }
    //
}
