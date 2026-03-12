<?php

namespace App\Actions\Sorteo;

use App\Actions\Action;
use App\Enums\InstanciaStatus;
use App\Models\InstanciaSorteo;
use App\Models\Sorteo;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class StoreInstanciaSorteo extends Action
{
    /**
     * @param array{sorteo_id: int, nombre: string, fecha_ejecucion: string} $data
     * @return InstanciaSorteo
     */
    public static function execute(array $data): InstanciaSorteo
    {
        $sorteo = Sorteo::findOrFail($data['sorteo_id']);

        $instancia = $sorteo->instancias()->create([
            'nombre' => $data['nombre'],
            'fecha_ejecucion' => Carbon::parse($data['fecha_ejecucion']),
            'estado' => InstanciaStatus::Pendiente,
        ]);

        return $instancia;
    }
}
