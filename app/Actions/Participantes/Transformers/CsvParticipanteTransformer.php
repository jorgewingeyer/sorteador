<?php

namespace App\Actions\Participantes\Transformers;

use App\Actions\Action;

/**
 * CsvParticipanteTransformer
 *
 * Maps a CSV row into participante DB attributes.
 */
abstract class CsvParticipanteTransformer extends Action
{
    private static function sanitize(?string $value): string
    {
        $v = $value ?? '';
        // Normalize encoding to UTF-8 and strip invalid bytes
        $v = @mb_convert_encoding($v, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
        // Trim and collapse whitespace
        $v = trim($v);

        return $v;
    }

    /**
     * @param  array<string,string|null>  $rowByHeader
     * @return array<string,mixed>
     */
    public static function execute(array $rowByHeader, int $sorteoId): array
    {
        $dniRaw = self::sanitize($rowByHeader['dni'] ?? $rowByHeader['DNI'] ?? '');
        $dni = str_replace(['.', ' '], '', $dniRaw);

        $nombre = self::sanitize($rowByHeader['nombre'] ?? $rowByHeader['Nombre'] ?? '');
        $apellido = self::sanitize($rowByHeader['apellido'] ?? $rowByHeader['Apellido'] ?? '');
        
        // Handle case where full_name is in a single column or split
        if (empty($nombre) && empty($apellido) && isset($rowByHeader['full_name'])) {
             $fullName = self::sanitize($rowByHeader['full_name']);
        } else {
             $fullName = trim($nombre.' '.$apellido);
        }

        $phone = self::sanitize($rowByHeader['tel'] ?? $rowByHeader['Tel.'] ?? $rowByHeader['telefono'] ?? $rowByHeader['phone'] ?? '');
        $location = self::sanitize($rowByHeader['localidad'] ?? $rowByHeader['Localidad'] ?? $rowByHeader['location'] ?? '');
        $province = self::sanitize($rowByHeader['provincia'] ?? $rowByHeader['Provincia'] ?? $rowByHeader['province'] ?? '');

        // Support various header names for carton number
        // Keys are normalized in ImportParticipantesFromCSV (lowercase, no spaces, no dots, unaccented)
        $carton = self::sanitize(
            $rowByHeader['nro_carton'] ?? 
            $rowByHeader['nro_cartn'] ?? // Fallback for bad encoding
            $rowByHeader['carton'] ?? 
            $rowByHeader['carton_number'] ?? 
            ''
        );
        
        return [
            'sorteo_id' => $sorteoId,
            'dni' => $dni,
            'full_name' => $fullName,
            'phone' => $phone,
            'location' => $location,
            'province' => $province,
            'carton_number' => $carton,
        ];
    }
}
