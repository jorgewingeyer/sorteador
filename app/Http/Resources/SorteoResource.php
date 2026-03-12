<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use App\Http\Resources\Premios\PremioResource;
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
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'is_active' => (bool) $this->is_active,
            'created_at' => optional($this->created_at)->toISOString(),
            // Remove 'premios' if prizes are now on instances, or keep it if we want to show all prizes across all instances?
            // The plan says prizes are on instances. But maybe we want to show them?
            // For now, let's remove it to avoid errors if the relation doesn't exist.
            'instancias' => $this->whenLoaded('instancias', function () {
                return InstanciaSorteoResource::collection($this->instancias)->resolve();
            }),
        ];
    }
}
