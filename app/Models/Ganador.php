<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ganador extends Model
{
    protected $table = 'ganadores';

    protected $fillable = [
        'instancia_sorteo_id',
        'carton_number',
        'premio_instancia_id',
        'winning_position',
        'inscripto_id'
    ];

    public function instanciaSorteo(): BelongsTo
    {
        return $this->belongsTo(InstanciaSorteo::class);
    }

    public function premioInstancia(): BelongsTo
    {
        return $this->belongsTo(PremioInstancia::class);
    }

    public function inscripto(): BelongsTo
    {
        return $this->belongsTo(Inscripto::class);
    }

    public function entregaPremio(): HasOne
    {
        return $this->hasOne(EntregaPremio::class);
    }
}
