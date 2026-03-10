<?php

namespace App\Actions\Sorteo;

use App\Models\InstanciaSorteo;
use App\Models\ParticipanteSorteo;
use App\Models\Ganador;
use App\Models\Inscripto;
use App\Models\PremioInstancia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        $instancia = InstanciaSorteo::findOrFail($instanciaSorteoId);

        if ($instancia->estado === 'finalizada') {
            throw new Exception("Esta instancia de sorteo ya ha finalizado.");
        }

        // 1. Verificar si hay participantes habilitados
        $totalParticipantes = ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)->count();

        if ($totalParticipantes === 0) {
            throw new Exception("No hay participantes habilitados para este sorteo. Ejecute la limpieza primero.");
        }

        // 2. Determinar qué premio se sortea (siguiente posición disponible)
        // Buscamos el premio con la posición más alta que AÚN NO haya sido asignado a un ganador
        // Ojo: Si hay múltiples cantidades de un mismo premio, se debe manejar.
        // Simplificación: Asumimos que cada "tiro" de sorteo asigna UN premio.
        
        $premiosAsignadosCount = Ganador::where('instancia_sorteo_id', $instanciaSorteoId)->count();
        
        // Buscamos el siguiente premio en la lista ordenada por posición
        // Esto asume que se sortean en orden ascendente (1er premio, 2do premio...) o descendente según config.
        // Vamos a asumir orden: 1, 2, 3...
        $siguientePosicion = $premiosAsignadosCount + 1;
        
        $premioInstancia = PremioInstancia::where('instancia_sorteo_id', $instanciaSorteoId)
            ->where('posicion', $siguientePosicion)
            ->first();

        if (!$premioInstancia) {
            // Si no hay premio específico para esta posición, ¿qué hacemos?
            // Podríamos lanzar error o decir que se acabaron los premios.
            throw new Exception("No hay más premios configurados para sortear (Posición {$siguientePosicion}).");
        }

        DB::beginTransaction();

        try {
            // 3. Selección Aleatoria Segura (O(1) con random offset)
            // random_int es criptográficamente seguro.
            $randomIndex = random_int(0, $totalParticipantes - 1);
            
            $ganadorSorteo = ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)
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

            $ganadoresRegistrados = [];

            foreach ($inscriptosGanadores as $inscripto) {
                $ganador = Ganador::create([
                    'instancia_sorteo_id' => $instanciaSorteoId,
                    'carton_number' => $cartonGanador,
                    'premio_instancia_id' => $premioInstancia->id,
                    'winning_position' => $siguientePosicion,
                    'inscripto_id' => $inscripto->id,
                ]);
                
                $ganadoresRegistrados[] = $ganador;
            }

            // 5. Eliminar al ganador de la tabla de participantes_sorteo para que no vuelva a ganar en esta misma instancia
            // (Si hay más premios en la misma fecha)
            ParticipanteSorteo::where('instancia_sorteo_id', $instanciaSorteoId)
                ->where('carton_number', $cartonGanador)
                ->delete();

            // Auditoría
            // ... (Implementar log de auditoría aquí si se requiere)

            DB::commit();

            return [
                'status' => 'success',
                'carton_ganador' => $cartonGanador,
                'premio' => $premioInstancia->premio->nombre,
                'posicion' => $siguientePosicion,
                'total_ganadores' => count($ganadoresRegistrados),
                'ganadores' => $ganadoresRegistrados
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
