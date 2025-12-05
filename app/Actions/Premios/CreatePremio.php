<?php

namespace App\Actions\Premios;

use App\Models\Premio;

abstract class CreatePremio
{
    public static function execute(array $input): Premio
    {
        return Premio::create([
            'nombre' => $input['nombre'],
            'descripcion' => $input['descripcion'] ?? null,
        ]);
    }
}
