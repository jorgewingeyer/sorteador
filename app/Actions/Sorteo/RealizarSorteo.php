<?php

namespace App\Actions\Sorteo;

use App\Models\Participante;
use App\Models\Sorteo;
use Exception;
use Illuminate\Support\Facades\Log;

class RealizarSorteo
{
    /**
     * Realiza un sorteo aleatorio seleccionando un número de cartón único.
     * 
     * Este método implementa una deduplicación lógica para garantizar equidad:
     * 1. Identifica todos los números de cartón únicos participantes.
     * 2. Selecciona aleatoriamente uno de esos cartones.
     * 3. Asigna el premio a TODOS los participantes que tengan ese cartón.
     * 
     * Esto asegura que tener múltiples registros con el mismo cartón no aumenta
     * las probabilidades de ganar. La probabilidad es 1/N donde N es la cantidad
     * de cartones únicos, no la cantidad de registros.
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

        // 1. Obtener lista de cartones únicos que NO han ganado
        // Usamos distinct() para la deduplicación lógica
        $cartonesDisponibles = Participante::where('sorteo_id', $sorteoId)
            ->whereNull('ganador_en')
            ->whereNotNull('carton_number') // Asegurar que tenga cartón
            ->distinct()
            ->pluck('carton_number');

        $totalCartonesUnicos = $cartonesDisponibles->count();

        // Obtener total de registros brutos (para comparación en debug)
        $totalRegistrosParticipantes = Participante::where('sorteo_id', $sorteoId)
            ->whereNull('ganador_en')
            ->count();

        // Verificar que existan participantes disponibles
        if ($totalCartonesUnicos === 0) {
            throw new Exception('No hay participantes (cartones) disponibles para el sorteo.');
        }

        // 2. Generar un índice aleatorio criptográficamente seguro
        // random_int es inclusivo (min, max), por lo tanto si tenemos N elementos,
        // los índices válidos van de 0 a N-1.
        // Ejemplo: 3 elementos -> índices 0, 1, 2. count = 3. max = 3-1 = 2.
        $indiceAleatorio = random_int(0, $totalCartonesUnicos - 1);

        // 3. Obtener el número de cartón ganador
        $cartonGanador = $cartonesDisponibles[$indiceAleatorio];

        // 4. Buscar TODOS los participantes asociados a ese cartón
        // Esto maneja el caso de múltiples registros con el mismo cartón
        $ganadores = Participante::where('sorteo_id', $sorteoId)
            ->where('carton_number', $cartonGanador)
            ->get();

        if ($ganadores->isEmpty()) {
            throw new Exception('Error inesperado: El cartón sorteado no tiene participantes asociados.');
        }

        // Timestamp en formato ISO-8601
        $timestamp = now();

        // 5. Calcular la posición del premio (Sorteo Nro X)
        // Contamos cuántos sorteos únicos (posiciones) ya se han realizado
        // Usamos distinct para contar eventos de sorteo, no ganadores individuales
        $sorteosRealizados = Participante::where('sorteo_id', $sorteoId)
            ->whereNotNull('ganador_en')
            ->distinct('ganador_en')
            ->count('ganador_en');

        $posicionGanador = $sorteosRealizados + 1;

        // Lógica de asignación de premios
        $premioNombre = 'Sin premio asignado';
        
        if ($sorteo) {
            // Obtener posiciones de premios ordenadas descendente (Mayor a menor)
            $posicionesPremios = $sorteo->premios()
                ->withPivot('posicion')
                ->get()
                ->pluck('pivot.posicion')
                ->sortDesc()
                ->values();

            $totalPremios = $posicionesPremios->count();

            if ($totalPremios > 0) {
                // Si ya se entregaron todos los premios definidos
                if ($sorteosRealizados >= $totalPremios) {
                    throw new Exception('Se han sorteado todos los premios disponibles para este sorteo.');
                }

                // Asignar la posición del premio correspondiente
                // Usamos $sorteosRealizados como índice
                $posicionGanador = $posicionesPremios[$sorteosRealizados];
                
                // Obtener el nombre del premio
                $premioObj = $sorteo->premios()
                    ->wherePivot('posicion', $posicionGanador)
                    ->first();
                    
                if ($premioObj) {
                    $premioNombre = $premioObj->nombre;
                }
            } else {
                throw new Exception('Este sorteo no tiene premios asignados para sortear.');
            }
        }

        // 6. Marcar a TODOS los ganadores con el mismo cartón
        foreach ($ganadores as $ganador) {
            $ganador->ganador_en = $posicionGanador;
            $ganador->save();
        }

        $totalGanadoresAfectados = $ganadores->count();

        // Registrar el sorteo en los logs
        Log::info('Sorteo realizado (Deduplicación Lógica)', [
            'carton_ganador' => $cartonGanador,
            'posicion_sorteo' => $posicionGanador,
            'premio' => $premioNombre,
            'total_cartones_unicos' => $totalCartonesUnicos,
            'total_registros_brutos' => $totalRegistrosParticipantes,
            'duplicados_filtrados' => $totalRegistrosParticipantes - $totalCartonesUnicos,
            'ganadores_afectados_count' => $totalGanadoresAfectados,
            'timestamp' => $timestamp->toIso8601String(),
            'probabilidad_carton' => '1/' . $totalCartonesUnicos,
        ]);

        // Retornar solo la información del cartón ganador y el premio
        return [
            'carton_number' => $cartonGanador,
            'premio' => $premioNombre,
            'posicion_sorteo' => $posicionGanador,
            'total_ganadores' => $totalGanadoresAfectados, // Cantidad de participantes con este cartón
            'timestamp' => $timestamp->toIso8601String(),
            'debug_info' => [
                'total_registros' => $totalRegistrosParticipantes,
                'total_cartones_unicos' => $totalCartonesUnicos,
                'duplicados_ignorados' => $totalRegistrosParticipantes - $totalCartonesUnicos,
            ]
        ];
    }
}
