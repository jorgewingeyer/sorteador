<?php

namespace App\Http\Requests\EntregaPremio;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ganador_id' => ['required', 'exists:ganadores,id'],
            'dni_receptor' => ['nullable', 'string', 'max:64'],
            'nombre_receptor' => ['nullable', 'string', 'max:255'],
            'observaciones' => ['nullable', 'string', 'max:1000'],
            'foto_evidencia' => ['nullable', 'image', 'max:10240'], // Max 10MB
        ];
    }

    public function messages(): array
    {
        return [
            'ganador_id.required' => 'El ID del ganador es obligatorio.',
            'ganador_id.exists' => 'El ganador seleccionado no existe.',
            'foto_evidencia.image' => 'El archivo debe ser una imagen.',
            'foto_evidencia.max' => 'La imagen no debe pesar más de 10MB.',
        ];
    }
}
