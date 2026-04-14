<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Premio extends Model
{
    protected $fillable = ['nombre', 'descripcion', 'imagen_path'];

    public function instancias(): HasMany
    {
        return $this->hasMany(PremioInstancia::class);
    }
}
