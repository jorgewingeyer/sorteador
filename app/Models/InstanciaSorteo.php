<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class InstanciaSorteo extends Model
{
    protected $table = 'instancias_sorteo';

    protected $fillable = [
        'sorteo_id',
        'nombre',
        'fecha_ejecucion',
        'estado'
    ];

    protected $casts = [
        'fecha_ejecucion' => 'datetime',
    ];

    public function sorteo(): BelongsTo
    {
        return $this->belongsTo(Sorteo::class);
    }

    public function participantesSorteo(): HasMany
    {
        return $this->hasMany(ParticipanteSorteo::class);
    }

    public function ganadores(): HasMany
    {
        return $this->hasMany(Ganador::class);
    }

    // Relación directa a los premios asignados a esta instancia (via pivot model)
    public function premiosInstancia(): HasMany
    {
        return $this->hasMany(PremioInstancia::class);
    }
}
