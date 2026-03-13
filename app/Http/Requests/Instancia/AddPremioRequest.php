<?php

namespace App\Http\Requests\Instancia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddPremioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $instanciaId = (int) ($this->route('instancia')?->id ?? $this->route('instancia'));

        return [
            'premio_id' => ['required', 'integer', 'exists:premios,id'],
            'posicion' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('premio_instancia', 'posicion')->where(fn ($q) => $q->where('instancia_sorteo_id', $instanciaId)),
            ],
            'cantidad' => ['integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'premio_id.required' => 'Selecciona un premio válido.',
            'premio_id.exists' => 'El premio seleccionado no existe.',
            'posicion.required' => 'Ingresa la posición.',
            'posicion.unique' => 'Esa posición ya está asignada en esta instancia.',
            'cantidad.min' => 'La cantidad debe ser al menos 1.',
        ];
    }
}
