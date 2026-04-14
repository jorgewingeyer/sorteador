<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sorteo extends Model
{
    protected $fillable = 
    [
        'nombre', 
        'descripcion', 
        'is_active', 
        'instancias_por_sorteo'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function instancias(): HasMany
    {
        return $this->hasMany(InstanciaSorteo::class);
    }

    public function inscriptos(): HasMany
    {
        return $this->hasMany(Inscripto::class);
    }
}
