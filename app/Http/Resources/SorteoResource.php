<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SorteoResource
 *
 * Formats sorteos for frontend consumption.
 */
class SorteoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $fecha = $this->fecha instanceof Carbon ? $this->fecha : (is_string($this->fecha) ? Carbon::parse($this->fecha) : null);

        $today = now()->startOfDay();
        $estado = 'pendiente';
        if ($fecha instanceof Carbon) {
            if ($fecha->isSameDay($today)) {
                $estado = 'hoy';
            } elseif ($fecha->lt($today)) {
                $estado = 'completado';
            }
        }

        // Map to badge variants used by UI
        $variant = match ($estado) {
            'completado' => 'secondary',
            'hoy' => 'default',
            default => 'outline',
        };

        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'fecha' => $fecha instanceof Carbon ? $fecha->format('d/m/Y') : '',
            'estado' => [
                'code' => $estado,
                'label' => match ($estado) {
                    'completado' => 'Completado',
                    'hoy' => 'Hoy',
                    default => 'Pendiente',
                },
                'variant' => $variant,
            ],
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
