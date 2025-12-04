<?php

namespace App\Actions\Sorteo;

use App\Actions\Action;
use App\Events\SorteoCreated;
use App\Models\Sorteo;

class StoreSorteo extends Action
{
    /**
     * @param  array{nombre:string,fecha:string}  $data
     */
    public static function execute(array $data): Sorteo
    {
        $sorteo = Sorteo::create([
            'nombre' => $data['nombre'],
            'fecha' => $data['fecha'],
        ]);

        event(new SorteoCreated($sorteo));

        return $sorteo;
    }
}
