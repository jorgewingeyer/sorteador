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
        $dni = str_replace('.', '', $dniRaw);

        $nombre = self::sanitize($rowByHeader['nombre'] ?? $rowByHeader['Nombre'] ?? '');
        $apellido = self::sanitize($rowByHeader['apellido'] ?? $rowByHeader['Apellido'] ?? '');
        $fullName = trim($nombre.' '.$apellido);

        $phone = self::sanitize($rowByHeader['tel'] ?? $rowByHeader['Tel.'] ?? $rowByHeader['telefono'] ?? '');
        $location = self::sanitize($rowByHeader['localidad'] ?? $rowByHeader['Localidad'] ?? '');
        $province = self::sanitize($rowByHeader['provincia'] ?? $rowByHeader['Provincia'] ?? '');

        $carton = self::sanitize($rowByHeader['nro_carton'] ?? $rowByHeader['Nro. Carton'] ?? $rowByHeader['Nro. Cartón'] ?? $rowByHeader['carton'] ?? '');
        $cartonNumber = $carton;

        return [
            'sorteo_id' => $sorteoId,
            'dni' => $dni,
            'full_name' => $fullName,
            'phone' => $phone,
            'location' => $location,
            'province' => $province,
            'carton_number' => $cartonNumber,
        ];
    }
}
