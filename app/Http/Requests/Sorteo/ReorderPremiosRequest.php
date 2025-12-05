<?php

namespace App\Http\Requests\Sorteo;

use Illuminate\Foundation\Http\FormRequest;

class ReorderPremiosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'premios' => ['required', 'array', 'min:1'],
            'premios.*.premio_id' => ['required', 'integer', 'exists:premios,id'],
            'premios.*.posicion' => ['required', 'integer', 'min:1', 'distinct'],
        ];
    }

    public function messages(): array
    {
        return [
            'premios.required' => 'Debes enviar al menos una asignación.',
            'premios.*.premio_id.required' => 'Selecciona un premio válido.',
            'premios.*.premio_id.exists' => 'El premio seleccionado no existe.',
            'premios.*.posicion.required' => 'Ingresa la posición.',
            'premios.*.posicion.distinct' => 'Las posiciones no pueden repetirse.',
        ];
    }
}
