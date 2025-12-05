<?php

namespace App\Actions\Sorteo;

use App\Actions\Action;
use App\Models\Sorteo;
use Illuminate\Support\Facades\DB;

abstract class RemovePremioFromSorteo extends Action
{
    public static function execute(Sorteo $sorteo, int $premioId, int $posicion): void
    {
        DB::transaction(function () use ($sorteo, $premioId, $posicion) {
            DB::table('premio_sorteo')
                ->where('sorteo_id', $sorteo->id)
                ->where('premio_id', $premioId)
                ->where('posicion', $posicion)
                ->delete();
        });
    }
}
