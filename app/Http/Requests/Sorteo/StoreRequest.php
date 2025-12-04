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
            'fecha' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es requerido',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres',
            'fecha.required' => 'La fecha es requerida',
            'fecha.date' => 'La fecha debe ser una fecha válida',
            'fecha.after' => 'La fecha debe ser posterior a hoy',
        ];
    }
}
