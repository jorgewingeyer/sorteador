<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ParticipanteResource
 *
 * Formats participantes for frontend consumption.
 */
class ParticipanteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sorteo_id' => $this->sorteo_id,
            'sorteo_nombre' => optional($this->sorteo)->nombre,
            'full_name' => (string) $this->full_name,
            'dni' => (string) $this->dni,
            'phone' => (string) ($this->phone ?? ''),
            'location' => (string) ($this->location ?? ''),
            'province' => (string) ($this->province ?? ''),
            'carton_number' => (string) ($this->carton_number ?? ''),
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
