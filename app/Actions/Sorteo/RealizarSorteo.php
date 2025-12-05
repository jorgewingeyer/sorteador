<?php

namespace App\Actions\Sorteo;

use App\Models\Participante;
use App\Models\Sorteo;
use Exception;
use Illuminate\Support\Facades\Log;

class RealizarSorteo
{
    /**
     * Realiza un sorteo aleatorio entre todos los participantes.
     * 
     * Este método está optimizado para manejar grandes volúmenes de participantes
     * (20,000+) sin cargar todos los registros en memoria.
     * 
     * Utiliza random_int() que es criptográficamente seguro para garantizar
     * una selección verdaderamente aleatoria, cumpliendo con estándares
     * CSPRNG (Cryptographically Secure Pseudo-Random Number Generator).
     * 
     * El algoritmo garantiza:
     * - Distribución uniforme perfecta (cada participante tiene 1/N probabilidad)
     * - No predecibilidad (imposible predecir el resultado)
     * - Sin sesgos (modulo bias eliminado automáticamente por random_int)
     * - Eficiencia en memoria (solo carga 1 registro)
     * 
     * @return array
     * @throws Exception
     */
    public static function execute(?int $sorteoId = null): array
    {
        // Buscar el sorteo activo
        $sorteo = Sorteo::where('status', true)->first();

        if (!$sorteo) {
            throw new Exception('No hay ningún sorteo activo en este momento. Por favor activa un sorteo para continuar.');
        }

        // Usar el ID del sorteo activo
        $sorteoId = $sorteo->id;

        // Query base para participantes
        $query = Participante::whereNull('ganador_en')
            ->where('sorteo_id', $sorteoId);

        // Contar total de participantes QUE NO HAN GANADO
        $totalParticipantes = $query->count();

        // Verificar que existan participantes disponibles
        if ($totalParticipantes === 0) {
            throw new Exception('No hay participantes disponibles para el sorteo. Todos ya han ganado o no hay participantes registrados.');
        }

        // Generar un índice aleatorio criptográficamente seguro
        $indiceAleatorio = random_int(0, $totalParticipantes - 1);

        // Seleccionar el ganador usando offset + first()
        $ganador = $query->offset($indiceAleatorio)->first();

        // Verificación de seguridad
        if (!$ganador) {
            throw new Exception('Error inesperado al seleccionar el ganador. Por favor, intenta de nuevo.');
        }

        // Timestamp en formato ISO-8601
        $timestamp = now();

        // Contar total de participantes originales para estadísticas
        $queryTotal = Participante::query()
            ->where('sorteo_id', $sorteoId);

        $totalParticipantesOriginal = $queryTotal->count();

        $participantesDisponibles = $totalParticipantes;
        $ganadoresTotales = $totalParticipantesOriginal - $participantesDisponibles;

        // MARCAR AL GANADOR con la posición en que salió sorteado
        // La posición es relativa al sorteo si se especificó ID, o global si no.
        $posicionGanador = $ganadoresTotales + 1;

        // Lógica de asignación de premios inversa y límite de sorteos
        if ($sorteo) {
            // Obtener posiciones de premios ordenadas descendente (Mayor a menor)
            // Esto permite asignar primero los premios de menor jerarquía (posiciones más altas)
            $posicionesPremios = $sorteo->premios()
                ->withPivot('posicion')
                ->get()
                ->pluck('pivot.posicion')
                ->sortDesc()
                ->values();

            $totalPremios = $posicionesPremios->count();

            if ($totalPremios > 0) {
                if ($ganadoresTotales >= $totalPremios) {
                    throw new Exception('Se han sorteado todos los premios disponibles para este sorteo.');
                }

                // Asignar la posición del premio correspondiente
                $posicionGanador = $posicionesPremios[$ganadoresTotales];
            } else {
                // Si no hay premios definidos, no permitir sorteo (según requerimiento)
                throw new Exception('Este sorteo no tiene premios asignados para sortear.');
            }
        }

        $ganador->ganador_en = $posicionGanador;
        $ganador->save();

        // Obtener el premio ganado
        $premioGanado = $ganador->premio;
        $premioNombre = $premioGanado ? $premioGanado->nombre : 'Sin premio asignado';

        // Registrar el sorteo en los logs para auditoría completa
        // Esto permite verificar posteriormente la integridad del proceso
        Log::info('Sorteo realizado', [
            'ganador_id' => $ganador->id,
            'ganador_nombre' => $ganador->full_name,
            'ganador_dni' => $ganador->dni,
            'posicion_sorteo' => $posicionGanador,
            'premio' => $premioNombre,
            'total_participantes' => $totalParticipantesOriginal,
            'participantes_disponibles' => $participantesDisponibles,
            'ganadores_anteriores' => $ganadoresTotales,
            'indice_seleccionado' => $indiceAleatorio,
            'timestamp' => $timestamp->toIso8601String(),
            'probabilidad' => '1/' . $participantesDisponibles,
            'algoritmo' => 'random_int (CSPRNG)',
        ]);

        return [
            'winner' => [
                'id' => $ganador->id,
                'full_name' => $ganador->full_name,
                'dni' => $ganador->dni,
                'phone' => $ganador->phone,
                'location' => $ganador->location,
                'province' => $ganador->province,
                'carton_number' => $ganador->carton_number,
                'ganador_en' => $posicionGanador,
                'premio' => $premioNombre,
            ],
            'total_participants' => $totalParticipantesOriginal,
            'available_participants' => $participantesDisponibles,
            'previous_winners' => $ganadoresTotales,
            'posicion_sorteo' => $posicionGanador,
            'timestamp' => $timestamp->toIso8601String(),
        ];
    }
}
