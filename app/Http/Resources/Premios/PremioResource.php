<?php

namespace App\Http\Resources\Premios;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PremioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $posicion = isset($this->pivot) ? ($this->pivot->posicion ?? null) : null;

        return [
            'id' => $data['id'] ?? $this->id,
            'nombre' => $data['nombre'] ?? $this->nombre,
            'descripcion' => $data['descripcion'] ?? ($this->descripcion ?? null),
            'posicion' => $posicion,
            'created_at' => $this->created_at instanceof Carbon ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at instanceof Carbon ? $this->updated_at->toIso8601String() : null,
            'sorteos' => $this->whenLoaded('sorteos', function () {
                return $this->sorteos->map(function ($sorteo) {
                    return [
                        'id' => $sorteo->id,
                        'nombre' => $sorteo->nombre,
                        'fecha' => $sorteo->fecha,
                        'posicion' => $sorteo->pivot->posicion ?? null,
                    ];
                })->values();
            }),
        ];
    }
}
