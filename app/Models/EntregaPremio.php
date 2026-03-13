<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntregaPremio extends Model
{
    protected $table = 'entregas_premios';

    protected $fillable = [
        'ganador_id',
        'fecha_entrega',
        'dni_receptor',
        'nombre_receptor',
        'observaciones',
        'foto_evidencia_path'
    ];

    protected $casts = [
        'fecha_entrega' => 'datetime',
    ];

    public function ganador(): BelongsTo
    {
        return $this->belongsTo(Ganador::class);
    }
}
