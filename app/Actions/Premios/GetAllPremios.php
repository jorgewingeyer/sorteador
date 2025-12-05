<?php

namespace App\Actions\Premios;

use App\Actions\Action;
use App\Models\Premio;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

/**
 * GetAllPremios Action
 *
 * Returns paginated premios with optional filtering and sorting.
 */
abstract class GetAllPremios extends Action
{
    public static function execute(array $options = []): LengthAwarePaginator
    {
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

        $query = Premio::query()->with([
            'sorteos' => function ($q) {
                $q->select('sorteos.id', 'sorteos.nombre', 'sorteos.fecha');
            },
        ]);

        if (! empty($options['nombre'])) {
            $query->where('nombre', 'like', '%'.$options['nombre'].'%');
        }

        try {
            $query->orderBy($sort, $direction);
            return $query->paginate($perPage, ['*'], 'page', $page);
        } catch (\Exception $e) {
            Log::error('Error al obtener premios: '.$e->getMessage());
            return Premio::query()->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
        }
    }
}
