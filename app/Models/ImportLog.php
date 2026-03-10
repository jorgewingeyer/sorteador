<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportLog extends Model
{
    protected $table = 'import_logs';

    protected $fillable = [
        'sorteo_id',
        'file_name',
        'file_size',
        'total_rows',
        'imported_rows',
        'skipped_rows',
        'error_log',
        'user_id',
    ];

    protected $casts = [
        'error_log' => 'array',
    ];

    public function sorteo(): BelongsTo
    {
        return $this->belongsTo(Sorteo::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
