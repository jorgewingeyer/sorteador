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

        if ($sorteo->instancias()->count() >= $sorteo->instancias_por_sorteo) {
            throw ValidationException::withMessages([
                'error' => 'No se pueden crear más instancias para este sorteo. El límite es ' . $sorteo->instancias_por_sorteo . '.'
            ]);
        }

        $instancia = $sorteo->instancias()->create([
            'nombre' => $data['nombre'],
            'fecha_ejecucion' => Carbon::parse($data['fecha_ejecucion']),
            'estado' => InstanciaStatus::Pendiente,
        ]);

        return $instancia;
    }
}
