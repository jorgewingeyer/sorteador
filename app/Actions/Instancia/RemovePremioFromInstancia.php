<?php

namespace App\Actions\Instancia;

use App\Actions\Action;
use App\Models\InstanciaSorteo;
use App\Models\PremioInstancia;
use Illuminate\Support\Facades\DB;

abstract class RemovePremioFromInstancia extends Action
{
    public static function execute(InstanciaSorteo $instancia, int $premioId, int $posicion): void
    {
        DB::transaction(function () use ($instancia, $premioId, $posicion) {
            PremioInstancia::where('instancia_sorteo_id', $instancia->id)
                ->where('premio_id', $premioId)
                ->where('posicion', $posicion)
                ->delete();
        });
    }
}
