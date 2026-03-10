<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inscripto extends Model
{
    protected $fillable = [
        'sorteo_id',
        'full_name',
        'dni',
        'carton_number',
        'phone',
        'location',
        'province',
    ];

    public function sorteo(): BelongsTo
    {
        return $this->belongsTo(Sorteo::class);
    }

    public function ganadores(): HasMany
    {
        return $this->hasMany(Ganador::class);
    }
}
