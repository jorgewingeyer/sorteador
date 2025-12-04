<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participante extends Model
{
    protected $fillable = [
        'sorteo_id',
        'full_name',
        'dni',
        'phone',
        'location',
        'province',
        'carton_number'];

    public function sorteo()
    {
        return $this->belongsTo(Sorteo::class);
    }
}
