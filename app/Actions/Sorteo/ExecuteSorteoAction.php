<?php

namespace App\Actions\Sorteo;

use App\Enums\InstanciaStatus;
use App\Models\InstanciaSorteo;
use App\Models\ParticipanteSorteo;
use App\Models\Ganador;
use App\Models\Inscripto;
use App\Models\PremioInstancia;
use App\Models\SorteoAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Exception;

class ExecuteSorteoAction
{
    /**
     * Ejecuta el sorteo para una instancia específica.
     * Selecciona un ganador aleatorio de la tabla participantes_sorteo (ya limpia).
     *
     * @param int $instanciaSorteoId
     * @return array Resultado del sorteo
     * @throws Exception
     */
    public static function execute(int $instanciaSorteoId): array
    {
        $startTime = microtime(true);
        $instancia = InstanciaSorteo::findOrFail($instanciaSorteoId);

        if ($instancia->estado === InstanciaStatus::Finalizada) {
            throw new Exception("Esta instancia de sorteo ya ha finalizado.");
        }

        // 1. Verificar si hay participantes habilitados
        $totalParticipantes = ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)->count();

        if ($totalParticipantes === 0) {
            throw new Exception("No hay participantes habilitados para este sorteo. Ejecute la limpieza primero.");
        }

        // 2. Determinar qué premio se sortea (siguiente disponible según cantidad)
        $premiosConfigurados = PremioInstancia::where('instancia_sorteo_id', $instanciaSorteoId)
            ->with('premio') // Eager load premio para el nombre
            ->orderBy('posicion', 'desc') // Orden descendente (5, 4, 3, 2, 1)
            ->get();
            
        // Obtener conteo de ganadores por premio para saber cuáles están llenos
        $ganadoresPorPremio = Ganador::where('instancia_sorteo_id', $instanciaSorteoId)
            ->select('premio_instancia_id', DB::raw('count(*) as total'))
            ->groupBy('premio_instancia_id')
            ->pluck('total', 'premio_instancia_id')
            ->toArray();
            
        $premioInstancia = null;
        
        foreach ($premiosConfigurados as $premio) {
            $cantidadAsignada = $ganadoresPorPremio[$premio->id] ?? 0;
            $cantidadTotal = $premio->cantidad ?? 1;
            
            if ($cantidadAsignada < $cantidadTotal) {
                $premioInstancia = $premio;
                break;
            }
        }

        if (!$premioInstancia) {
            throw new Exception("No hay más premios configurados para sortear.");
        }
        
        $siguientePosicion = $premioInstancia->posicion;

        DB::beginTransaction();

        try {
            // 3. Selección Aleatoria Segura (O(1) con random offset)
            // random_int es criptográficamente seguro.
            $randomIndex = random_int(0, $totalParticipantes - 1);
            
            $ganadorSorteo = ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)
                ->orderBy('id') // Orden estable para skip
                ->skip($randomIndex)
                ->take(1)
                ->first();

            if (!$ganadorSorteo) {
                throw new Exception("Error al seleccionar ganador aleatorio.");
            }

            $cartonGanador = $ganadorSorteo->carton_number;

            // 4. Registrar Ganadores (Todos los inscriptos con ese cartón)
            // Buscamos en la tabla Inscriptos (raw)
            $inscriptosGanadores = Inscripto::where('sorteo_id', $instancia->sorteo_id)
                ->where('carton_number', $cartonGanador)
                ->get();

            if ($inscriptosGanadores->isEmpty()) {
                Log::error("Sorteo Error: El cartón {$cartonGanador} salió sorteado pero no se encontró en la tabla de inscriptos (Sorteo ID: {$instancia->sorteo_id}).");
                throw new Exception("Inconsistencia: El cartón ganador ({$cartonGanador}) no tiene datos de inscripto asociados.");
            }

            $ganadoresRegistrados = [];

            foreach ($inscriptosGanadores as $inscripto) {
                $ganador = Ganador::create([
                    'instancia_sorteo_id' => $instanciaSorteoId,
                    'carton_number' => $cartonGanador,
                    'premio_instancia_id' => $premioInstancia->id,
                    'winning_position' => $siguientePosicion,
                    'inscripto_id' => $inscripto->id,
                    'user_id' => Auth::id(),
                ]);
                
                $ganadoresRegistrados[] = $ganador;
            }
            
            if (empty($ganadoresRegistrados)) {
                 throw new Exception("No se pudieron registrar ganadores para el cartón {$cartonGanador}.");
            }

            // 5. Eliminar al ganador de la tabla de participantes_sorteo para que no vuelva a ganar en esta misma instancia
            // (Si hay más premios en la misma fecha)
            ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)
                ->where('carton_number', $cartonGanador)
                ->delete();

            // 6. Verificar si se completaron todos los premios de la instancia
            // Actualizamos el conteo local para el premio actual
            $ganadoresPorPremio[$premioInstancia->id] = ($ganadoresPorPremio[$premioInstancia->id] ?? 0) + count($ganadoresRegistrados);
            
            $todosPremiosCompletados = true;
            foreach ($premiosConfigurados as $premio) {
                $cantidadAsignada = $ganadoresPorPremio[$premio->id] ?? 0;
                $cantidadTotal = $premio->cantidad ?? 1;
                
                if ($cantidadAsignada < $cantidadTotal) {
                    $todosPremiosCompletados = false;
                    break;
                }
            }

            if ($todosPremiosCompletados) {
                $instancia->estado = InstanciaStatus::Finalizada;
                $instancia->save();
                Log::info("Instancia de Sorteo {$instanciaSorteoId} finalizada automáticamente.");
            }

            // 7. Auditoría
            $executionTimeMs = (int) ((microtime(true) - $startTime) * 1000);
            
            SorteoAudit::create([
                'instancia_sorteo_id' => $instanciaSorteoId,
                'winning_carton_number' => $cartonGanador,
                'participants_pool_size' => $totalParticipantes,
                'execution_time_ms' => $executionTimeMs,
                'user_id' => Auth::id(),
                'snapshot_data' => [
                    'premio' => $premioInstancia->premio->nombre,
                    'posicion_sorteo' => $siguientePosicion,
                    'total_ganadores_registrados' => count($ganadoresRegistrados),
                    'random_index_selected' => $randomIndex,
                    'ganadores_ids' => collect($ganadoresRegistrados)->pluck('id')->toArray(),
                ],
            ]);

            DB::commit();

            return [
                'status' => 'success',
                'carton_number' => $cartonGanador,
                'premio' => $premioInstancia->premio->nombre,
                'posicion_sorteo' => $siguientePosicion,
                'total_ganadores' => count($ganadoresRegistrados),
                'timestamp' => now()->toIso8601String(),
                'ganadores' => $ganadoresRegistrados
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
