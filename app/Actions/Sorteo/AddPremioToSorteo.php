<?php

namespace App\Actions\Sorteo;

use App\Actions\Action;
use App\Models\Premio;
use App\Models\Sorteo;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

abstract class AddPremioToSorteo extends Action
{
    public static function execute(Sorteo $sorteo, int $premioId, int $posicion): void
    {
        DB::transaction(function () use ($sorteo, $premioId, $posicion) {
            if (!Premio::query()->whereKey($premioId)->exists()) {
                throw ValidationException::withMessages([
                    'premio_id' => ['El premio seleccionado no existe.'],
                ]);
            }

            $exists = DB::table('premio_sorteo')
                ->where('sorteo_id', $sorteo->id)
                ->where('posicion', $posicion)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'posicion' => ['Esa posición ya está asignada.'],
                ]);
            }

            $sorteo->premios()->attach($premioId, ['posicion' => $posicion]);
        });
    }
}
