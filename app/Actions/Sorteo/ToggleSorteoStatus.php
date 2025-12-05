<?php

namespace App\Actions\Sorteo;

use App\Actions\Action;
use App\Models\Sorteo;
use Illuminate\Support\Facades\DB;

abstract class ToggleSorteoStatus extends Action
{
    public static function execute(Sorteo $sorteo, bool $status): Sorteo
    {
        return DB::transaction(function () use ($sorteo, $status) {
            if ($status) {
                // If activating this sorteo, deactivate all others
                Sorteo::where('id', '!=', $sorteo->id)
                    ->where('status', true)
                    ->update(['status' => false]);
            }

            $sorteo->status = $status;
            $sorteo->save();

            return $sorteo;
        });
    }
}
