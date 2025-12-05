<?php

namespace App\Http\Requests\Sorteo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RemovePremioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sorteoId = (int) ($this->route('sorteo')?->id ?? $this->route('sorteo'));

        return [
            'premio_id' => ['required', 'integer', 'exists:premios,id'],
            'posicion' => [
                'required',
                'integer',
                'min:1',
                Rule::exists('premio_sorteo', 'posicion')->where(fn ($q) => $q->where('sorteo_id', $sorteoId)),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'premio_id.required' => 'Selecciona un premio válido.',
            'premio_id.exists' => 'El premio seleccionado no existe.',
            'posicion.required' => 'Ingresa la posición a eliminar.',
            'posicion.exists' => 'La posición no está asignada en este sorteo.',
        ];
    }
}
