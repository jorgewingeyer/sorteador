<?php

namespace App\Actions\Instancia;

use App\Actions\Action;
use App\Models\InstanciaSorteo;
use App\Models\Premio;
use App\Models\PremioInstancia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

abstract class AddPremioToInstancia extends Action
{
    public static function execute(InstanciaSorteo $instancia, int $premioId, int $posicion, int $cantidad = 1): void
    {
        DB::transaction(function () use ($instancia, $premioId, $posicion, $cantidad) {
            if (!Premio::query()->whereKey($premioId)->exists()) {
                throw ValidationException::withMessages([
                    'premio_id' => ['El premio seleccionado no existe.'],
                ]);
            }

            $exists = PremioInstancia::where('instancia_sorteo_id', $instancia->id)
                ->where('posicion', $posicion)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'posicion' => ['Esa posición ya está asignada en esta instancia.'],
                ]);
            }

            PremioInstancia::create([
                'instancia_sorteo_id' => $instancia->id,
                'premio_id' => $premioId,
                'posicion' => $posicion,
                'cantidad' => $cantidad,
            ]);
        });
    }
}
