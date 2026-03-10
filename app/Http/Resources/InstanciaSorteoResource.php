<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstanciaSorteoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'fecha_ejecucion' => $this->fecha_ejecucion ? $this->fecha_ejecucion->format('d/m/Y H:i') : null,
            'estado' => $this->estado,
            'sorteo_id' => $this->sorteo_id,
            'created_at' => $this->created_at->format('d/m/Y H:i'),
        ];
    }
}
