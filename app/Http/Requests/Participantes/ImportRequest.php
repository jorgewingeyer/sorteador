<?php

namespace App\Http\Requests\Participantes;

use Illuminate\Foundation\Http\FormRequest;

class ImportRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimetypes:text/csv,application/vnd.ms-excel,text/plain,application/csv,application/octet-stream', 'max:51200'],
            'sorteo_id' => ['required', 'integer', 'exists:sorteos,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'El archivo CSV es requerido.',
            'file.file' => 'Debe subir un archivo válido.',
            'file.mimetypes' => 'El archivo debe ser CSV válido.',
            'file.max' => 'El archivo no debe superar los 50MB.',
            'sorteo_id.required' => 'Debes seleccionar un sorteo.',
            'sorteo_id.exists' => 'El sorteo seleccionado no existe.',
        ];
    }
}
