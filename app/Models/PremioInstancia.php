<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PremioInstancia extends Model
{
    protected $table = 'premio_instancia';

    protected $fillable = [
        'instancia_sorteo_id',
        'premio_id',
        'posicion',
        'cantidad'
    ];

    public function instanciaSorteo(): BelongsTo
    {
        return $this->belongsTo(InstanciaSorteo::class);
    }

    public function premio(): BelongsTo
    {
        return $this->belongsTo(Premio::class);
    }

    public function ganadores(): HasMany
    {
        return $this->hasMany(Ganador::class);
    }
}
