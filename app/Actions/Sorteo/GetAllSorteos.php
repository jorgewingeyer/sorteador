<?php

namespace App\Actions\Sorteo;

use App\Actions\Action;
use App\Http\Resources\SorteoResource;
use App\Models\Sorteo;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * GetAllSorteos Action
 *
 * Returns paginated sorteos as JSON, with optional sorting.
 */
abstract class GetAllSorteos extends Action
{
    public static function execute(array $options = []): JsonResponse
    {
        try {
            $page = (int) ($options['page'] ?? 1);
            $perPage = (int) ($options['per_page'] ?? 15);
            $sort = (string) ($options['sort'] ?? 'fecha');
            $direction = strtolower((string) ($options['direction'] ?? 'desc'));

            $allowedSorts = ['fecha', 'nombre', 'created_at'];
            if (! in_array($sort, $allowedSorts, true)) {
                $sort = 'fecha';
            }
            if (! in_array($direction, ['asc', 'desc'], true)) {
                $direction = 'desc';
            }

            $query = Sorteo::query();

            if (! empty($options['nombre'])) {
                $query->where('nombre', 'like', '%'.$options['nombre'].'%');
            }

            if (! empty($options['fecha_from'])) {
                $query->whereDate('fecha', '>=', $options['fecha_from']);
            }

            if (! empty($options['fecha_to'])) {
                $query->whereDate('fecha', '<=', $options['fecha_to']);
            }

            if (! empty($options['estado'])) {
                $today = now()->startOfDay();
                if ($options['estado'] === 'pendiente') {
                    $query->whereDate('fecha', '>', $today);
                } elseif ($options['estado'] === 'hoy') {
                    $query->whereDate('fecha', '=', $today);
                } elseif ($options['estado'] === 'completado') {
                    $query->whereDate('fecha', '<', $today);
                }
            }

            $query->orderBy($sort, $direction);

            $paginator = $query->paginate($perPage, ['*'], 'page', $page);

            return SorteoResource::collection($paginator)
                ->additional(['status' => 'ok'])
                ->response();
        } catch (\Throwable $e) {
            Log::error('Error fetching sorteos', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'error' => [
                    'message' => 'No se pudieron recuperar los sorteos.',
                ],
            ], 500);
        }
    }
}
