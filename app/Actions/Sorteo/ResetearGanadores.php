<?php

namespace App\Actions\Sorteo;

use App\Models\Ganador;
use App\Models\InstanciaSorteo;
use App\Models\Inscripto;
use Illuminate\Support\Facades\Log;

class ResetearGanadores
{
    /**
     * Resetea los ganadores de un sorteo específico o de todos los sorteos.
     * 
     * ADVERTENCIA: Esta acción elimina el registro de los ganadores.
     * Úsala con precaución.
     * 
     * @param int|null $sorteoId ID del sorteo (null = resetear todos)
     * @return array
     */
    public static function execute(?int $sorteoId = null): array
    {
        // Construir query base
        $query = Ganador::query();

        // Filtrar por sorteo si se especifica
        if ($sorteoId !== null) {
            // Ganador está vinculado a InstanciaSorteo, que está vinculada a Sorteo
            $instancias = InstanciaSorteo::where('sorteo_id', $sorteoId)->pluck('id');
            $query->whereIn('instancia_sorteo_id', $instancias);
        }

        // Contar ganadores antes de resetear
        $totalGanadores = $query->count();

        if ($totalGanadores === 0) {
            $message = $sorteoId
                ? "No hay ganadores para resetear en el sorteo seleccionado."
                : "No hay ganadores para resetear.";

            return [
                'message' => $message,
                'ganadores_reseteados' => 0,
                'sorteo_id' => $sorteoId,
            ];
        }

        // Resetear ganadores (Eliminar registros)
        $query->delete();

        // Mensaje de log
        $logMessage = $sorteoId
            ? "Ganadores reseteados para sorteo ID: {$sorteoId}"
            : "Todos los ganadores reseteados";

        // Registrar en logs para auditoría
        Log::warning($logMessage, [
            'sorteo_id' => $sorteoId,
            'total_ganadores_reseteados' => $totalGanadores,
            'timestamp' => now()->toIso8601String(),
        ]);

        $message = $sorteoId
            ? "Los ganadores del sorteo han sido reseteados exitosamente."
            : "Todos los ganadores han sido reseteados exitosamente.";

        return [
            'message' => $message,
            'ganadores_reseteados' => $totalGanadores,
            'sorteo_id' => $sorteoId,
            'participantes_disponibles' => Inscripto::when(
                $sorteoId,
                fn($q) => $q->where('sorteo_id', $sorteoId)
            )->count(),
        ];
    }
}
