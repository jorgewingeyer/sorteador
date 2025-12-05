<?php

namespace App\Http\Requests\Sorteo;

use Illuminate\Foundation\Http\FormRequest;

class ToggleStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'El estado es requerido.',
            'status.boolean' => 'El estado debe ser verdadero o falso.',
        ];
    }
}
