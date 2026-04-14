<?php

namespace App\Actions\Participantes;

use App\Actions\Action;
use App\Http\Resources\ParticipanteResource;
use App\Models\Inscripto;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * GetAllParticipantes Action
 *
 * Returns paginated participantes as ResourceCollection, supports sorting and filtering.
 */
abstract class GetAllParticipantes extends Action
{
    /**
     * @return AnonymousResourceCollection
     */
    public static function execute(array $options = [])
    {
        try {
            $page = (int) ($options['page'] ?? 1);
            $perPage = (int) ($options['per_page'] ?? 50);
            $sort = (string) ($options['sort'] ?? 'created_at');
            $direction = strtolower((string) ($options['direction'] ?? 'desc'));

            $allowedSorts = ['created_at', 'full_name', 'dni', 'carton_number', 'sorteo_id'];
            if (!in_array($sort, $allowedSorts, true)) {
                $sort = 'created_at';
            }
            if (!in_array($direction, ['asc', 'desc'], true)) {
                $direction = 'desc';
            }

            $query = Inscripto::query()
                ->select(['id', 'sorteo_id', 'full_name', 'dni', 'phone', 'location', 'province', 'carton_number', 'created_at'])
                ->with(['sorteo:id,nombre', 'ganadores']);

            if (!empty($options['q'])) {
                $q = (string) $options['q'];
                $query->where(function ($w) use ($q) {
                    $w->where('full_name', 'ilike', '%' . $q . '%')
                        ->orWhere('dni', 'like', '%' . $q . '%')
                        ->orWhere('carton_number', 'like', '%' . $q . '%');
                });
            }

            if (!empty($options['sorteo_id'])) {
                $query->where('sorteo_id', (int) $options['sorteo_id']);
            }

            if (!empty($options['province'])) {
                $query->where('province', (string) $options['province']);
            }

            // Filtro por estado de ganador
            if (!empty($options['ganador_status'])) {
                $status = (string) $options['ganador_status'];

                if ($status === 'ganador') {
                    $query->has('ganadores');
                } elseif ($status === 'no_ganador') {
                    $query->doesntHave('ganadores');
                }
            }

            $query->orderBy($sort, $direction);

            // Cache key logic - removed cache for simplicity during development/refactor
            // Or keep it but cache the paginator result, not the response
            
            $paginator = $query->paginate($perPage, ['*'], 'page', $page);

            return ParticipanteResource::collection($paginator)
                ->additional(['status' => 'ok']);

        } catch (\Throwable $e) {
            Log::error('Error fetching participantes', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
