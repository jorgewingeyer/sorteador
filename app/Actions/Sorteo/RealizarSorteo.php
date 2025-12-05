<?php

namespace App\Actions\Sorteo;

use App\Models\Participante;
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
    public static function execute(): array
    {
        // Contar total de participantes QUE NO HAN GANADO
        // whereNull filtra solo participantes sin ganador_en (disponibles)
        // Esto es eficiente incluso con millones de registros
        $totalParticipantes = Participante::whereNull('ganador_en')->count();

        // Verificar que existan participantes disponibles
        if ($totalParticipantes === 0) {
            throw new Exception('No hay participantes disponibles para el sorteo. Todos ya han ganado o no hay participantes registrados.');
        }

        // Generar un índice aleatorio criptográficamente seguro
        // random_int() usa fuentes de entropía del sistema operativo:
        // - Linux/Unix: /dev/urandom o getrandom() syscall
        // - Windows: CryptGenRandom()
        // Garantiza distribución uniforme perfecta sin modulo bias
        $indiceAleatorio = random_int(0, $totalParticipantes - 1);

        // Seleccionar el ganador usando offset + first()
        // Solo considera participantes que NO han ganado (ganador_en IS NULL)
        // Solo carga 1 registro de la base de datos, no importa cuántos participantes haya
        $ganador = Participante::query()
            ->whereNull('ganador_en')
            ->offset($indiceAleatorio)
            ->first();

        // Verificación de seguridad (no debería ocurrir nunca, pero por si acaso)
        if (!$ganador) {
            throw new Exception('Error inesperado al seleccionar el ganador. Por favor, intenta de nuevo.');
        }

        // Timestamp en formato ISO-8601 para compatibilidad internacional
        $timestamp = now();

        // Contar total de participantes originales para estadísticas
        $totalParticipantesOriginal = Participante::count();
        $participantesDisponibles = $totalParticipantes;
        $ganadoresTotales = $totalParticipantesOriginal - $participantesDisponibles;

        // MARCAR AL GANADOR con la posición en que salió sorteado
        // La posición es: ganadores_anteriores + 1
        // Esto evita que sea seleccionado en sorteos futuros
        $posicionGanador = $ganadoresTotales + 1;
        $ganador->ganador_en = $posicionGanador;
        $ganador->save();

        // Registrar el sorteo en los logs para auditoría completa
        // Esto permite verificar posteriormente la integridad del proceso
        Log::info('Sorteo realizado', [
            'ganador_id' => $ganador->id,
            'ganador_nombre' => $ganador->full_name,
            'ganador_dni' => $ganador->dni,
            'posicion_sorteo' => $posicionGanador,
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
            ],
            'total_participants' => $totalParticipantesOriginal,
            'available_participants' => $participantesDisponibles,
            'previous_winners' => $ganadoresTotales,
            'posicion_sorteo' => $posicionGanador,
            'timestamp' => $timestamp->toIso8601String(),
        ];
    }
}
