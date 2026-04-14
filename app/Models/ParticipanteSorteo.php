<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParticipanteSorteo extends Model
{
    protected $table = 'participantes_sorteo';

    public $timestamps = false; // Solo usamos 'procesado_en'

    protected $fillable = [
        'instancia_sorteo_id',
        'carton_number',
        'procesado_en'
    ];

    protected $casts = [
        'procesado_en' => 'datetime',
    ];

    public function instanciaSorteo(): BelongsTo
    {
        return $this->belongsTo(InstanciaSorteo::class);
    }
}
