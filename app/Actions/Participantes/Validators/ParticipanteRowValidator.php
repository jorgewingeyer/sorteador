<?php

namespace App\Actions\Participantes\Validators;

use App\Actions\Action;
use Illuminate\Support\Facades\Validator;

/**
 * ParticipanteRowValidator
 *
 * Validates a mapped participante payload.
 */
abstract class ParticipanteRowValidator extends Action
{
    /**
     * @param  array<string,mixed>  $data
     * @return array{valid:bool,errors:array<int,string>}
     */
    public static function execute(array $data): array
    {
        $v = Validator::make($data, [
            'sorteo_id' => ['required', 'integer', 'exists:sorteos,id'],
            'dni' => ['required', 'string', 'max:32'],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'location' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'carton_number' => ['nullable', 'string', 'max:64'],
        ]);

        if ($v->fails()) {
            return [
                'valid' => false,
                'errors' => $v->errors()->all(),
            ];
        }

        return ['valid' => true, 'errors' => []];
    }
}
