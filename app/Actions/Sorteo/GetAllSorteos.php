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
            $sort = (string) ($options['sort'] ?? 'created_at');
            $direction = strtolower((string) ($options['direction'] ?? 'desc'));

            $allowedSorts = ['nombre', 'created_at'];
            if (! in_array($sort, $allowedSorts, true)) {
                $sort = 'created_at';
            }
            if (! in_array($direction, ['asc', 'desc'], true)) {
                $direction = 'desc';
            }

            $query = Sorteo::query();

            if (! empty($options['nombre'])) {
                $query->where('nombre', 'like', '%'.$options['nombre'].'%');
            }

            $query->orderBy($sort, $direction);

            $paginator = $query->with(['instancias'])->paginate($perPage, ['*'], 'page', $page);

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
