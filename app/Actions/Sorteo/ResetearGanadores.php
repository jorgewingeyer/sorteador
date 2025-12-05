<?php

namespace App\Actions\Sorteo;

use App\Models\Participante;
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
        $query = Participante::whereNotNull('ganador_en');

        // Filtrar por sorteo si se especifica
        if ($sorteoId !== null) {
            $query->where('sorteo_id', $sorteoId);
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

        // Resetear ganadores (poner ganador_en en NULL)
        $query->update(['ganador_en' => null]);

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
            'participantes_disponibles' => Participante::when(
                $sorteoId,
                fn($q) => $q->where('sorteo_id', $sorteoId)
            )->count(),
        ];
    }
}
