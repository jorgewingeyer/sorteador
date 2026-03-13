<?php

namespace App\Http\Requests\Sorteo;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:3', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'instancias_por_sorteo' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es requerido',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres',
            'instancias_por_sorteo.required' => 'La cantidad de instancias es requerida',
            'instancias_por_sorteo.integer' => 'La cantidad de instancias debe ser un número entero',
            'instancias_por_sorteo.min' => 'La cantidad de instancias debe ser al menos 1',
        ];
    }
}
