<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SorteoAudit extends Model
{
    protected $table = 'sorteo_audits';

    protected $fillable = [
        'instancia_sorteo_id',
        'winning_carton_number',
        'participants_pool_size',
        'execution_time_ms',
        'user_id',
        'snapshot_data'
    ];

    protected $casts = [
        'snapshot_data' => 'array',
    ];

    public function instanciaSorteo(): BelongsTo
    {
        return $this->belongsTo(InstanciaSorteo::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
