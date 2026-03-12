<?php

namespace App\Actions\Participantes;

use App\Actions\Action;
use App\Models\Inscripto;
use App\Models\Sorteo;
use Illuminate\Http\JsonResponse;

class GetParticipantesStats extends Action
{
    public static function execute(array $options = []): JsonResponse
    {
        $sorteoId = $options['sorteo_id'] ?? null;

        if (!$sorteoId) {
            $sorteo = Sorteo::where('status', true)->first();
            $sorteoId = $sorteo ? $sorteo->id : null;
        }

        if (!$sorteoId) {
            return response()->json([
                'total_registros' => 0,
                'total_cartones_unicos' => 0,
                'duplicados' => 0,
                'mensaje' => 'No hay sorteo activo seleccionado.'
            ]);
        }

        $query = Inscripto::where('sorteo_id', $sorteoId);

        $totalRegistros = $query->count();
        
        $totalCartonesUnicos = $query->whereNotNull('carton_number')
            ->distinct('carton_number')
            ->count('carton_number');

        return response()->json([
            'total_registros' => $totalRegistros,
            'total_cartones_unicos' => $totalCartonesUnicos,
            'duplicados' => $totalRegistros - $totalCartonesUnicos,
            'sorteo_id' => $sorteoId
        ]);
    }
}
