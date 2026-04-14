<?php

namespace App\Actions\Participantes;

use App\Actions\Action;
use App\Models\Ganador;
use App\Models\Inscripto;
use App\Models\InstanciaSorteo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanParticipantesAction extends Action
{
    /**
     * Limpia y recarga la tabla de participantes_sorteo para una instancia específica.
     * 
     * 1. Elimina registros previos de esa instancia.
     * 2. Obtiene inscriptos únicos del sorteo padre.
     * 3. Filtra cartones que ya ganaron en CUALQUIER instancia del mismo sorteo padre.
     * 4. Inserta masivamente en participantes_sorteo.
     */
    public static function execute(int $instanciaSorteoId): array
    {
        $instancia = InstanciaSorteo::findOrFail($instanciaSorteoId);
        $sorteoId = $instancia->sorteo_id;

        Log::info("Iniciando limpieza de participantes para instancia {$instanciaSorteoId} (Sorteo {$sorteoId})");

        try {
            DB::beginTransaction();

            // 1. Limpiar tabla de participantes para esta instancia (Truncado lógico)
            DB::table('participantes_sorteo')->where('instancia_sorteo_id', $instanciaSorteoId)->delete();

            // 2. Obtener lista negra de ganadores (Cartones que ya ganaron en este sorteo global)
            // Buscamos ganadores de TODAS las instancias que pertenezcan al mismo sorteo padre
            $cartonesGanadores = DB::table('ganadores')
                ->join('instancias_sorteo', 'ganadores.instancia_sorteo_id', '=', 'instancias_sorteo.id')
                ->where('instancias_sorteo.sorteo_id', $sorteoId)
                ->pluck('ganadores.carton_number')
                ->toArray();

            // 3. Preparar query de inscriptos únicos excluyendo ganadores
            $query = Inscripto::where('sorteo_id', $sorteoId)
                ->select('carton_number')
                ->distinct();

            if (!empty($cartonesGanadores)) {
                $query->whereNotIn('carton_number', $cartonesGanadores);
            }

            // Usamos cursor para manejo eficiente de memoria si son muchos
            $count = 0;
            $batchSize = 1000;
            $batch = [];

            foreach ($query->cursor() as $inscripto) {
                $batch[] = [
                    'instancia_sorteo_id' => $instanciaSorteoId,
                    'carton_number' => $inscripto->carton_number,
                    'procesado_en' => now(),
                ];

                if (count($batch) >= $batchSize) {
                    DB::table('participantes_sorteo')->insert($batch);
                    $count += count($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                DB::table('participantes_sorteo')->insert($batch);
                $count += count($batch);
            }

            DB::commit();

            Log::info("Finalizada limpieza. Total participantes habilitados: {$count}");

            return [
                'status' => 'success',
                'count' => $count,
                'message' => "Se han habilitado {$count} cartones únicos para el sorteo.",
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error en CleanParticipantesAction: " . $e->getMessage());
            throw $e;
        }
    }
}
