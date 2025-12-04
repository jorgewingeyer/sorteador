<?php

namespace App\Actions\Participantes;

use App\Actions\Action;
use App\Http\Resources\ParticipanteResource;
use App\Models\Participante;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * GetAllParticipantes Action
 *
 * Returns paginated participantes as JSON, supports sorting and filtering.
 */
abstract class GetAllParticipantes extends Action
{
    public static function execute(array $options = []): JsonResponse
    {
        try {
            $page = (int) ($options['page'] ?? 1);
            $perPage = (int) ($options['per_page'] ?? 50);
            $sort = (string) ($options['sort'] ?? 'created_at');
            $direction = strtolower((string) ($options['direction'] ?? 'desc'));

            $allowedSorts = ['created_at', 'full_name', 'dni', 'carton_number', 'sorteo_id'];
            if (! in_array($sort, $allowedSorts, true)) {
                $sort = 'created_at';
            }
            if (! in_array($direction, ['asc', 'desc'], true)) {
                $direction = 'desc';
            }

            $query = Participante::query()
                ->select(['id', 'sorteo_id', 'full_name', 'dni', 'phone', 'location', 'province', 'carton_number', 'created_at'])
                ->with(['sorteo:id,nombre']);

            if (! empty($options['q'])) {
                $q = (string) $options['q'];
                $query->where(function ($w) use ($q) {
                    $w->where('full_name', 'ilike', '%'.$q.'%')
                        ->orWhere('dni', 'like', '%'.$q.'%')
                        ->orWhere('carton_number', 'like', '%'.$q.'%');
                });
            }

            if (! empty($options['sorteo_id'])) {
                $query->where('sorteo_id', (int) $options['sorteo_id']);
            }

            if (! empty($options['province'])) {
                $query->where('province', (string) $options['province']);
            }

            $query->orderBy($sort, $direction);

            $cacheKey = 'participantes:list:'.md5(json_encode([
                'page' => $page,
                'per_page' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
                'q' => $options['q'] ?? null,
                'sorteo_id' => $options['sorteo_id'] ?? null,
                'province' => $options['province'] ?? null,
            ]));

            $response = Cache::remember($cacheKey, now()->addSeconds(30), function () use ($query, $perPage, $page) {
                $paginator = $query->paginate($perPage, ['*'], 'page', $page);

                return ParticipanteResource::collection($paginator)
                    ->additional(['status' => 'ok'])
                    ->response();
            });

            return $response;
        } catch (\Throwable $e) {
            Log::error('Error fetching participantes', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'error' => [
                    'message' => 'No se pudieron recuperar los participantes.',
                ],
            ], 500);
        }
    }
}
