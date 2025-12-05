<?php

namespace App\Actions\Sorteo;

use App\Actions\Action;
use App\Models\Sorteo;
use Illuminate\Support\Facades\DB;

abstract class UpdateSorteoPremios extends Action
{
    public static function execute(Sorteo $sorteo, array $premiosConfig): void
    {
        DB::transaction(function () use ($sorteo, $premiosConfig) {
            $sorteo->premios()->detach();
            foreach ($premiosConfig as $config) {
                $sorteo->premios()->attach($config['premio_id'], ['posicion' => $config['posicion']]);
            }
        });
    }
}
