<?php

namespace App\Actions\Sorteo;

use App\Models\EntregaPremio;
use App\Models\Ganador;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class RegisterEntregaPremioAction
{
    /**
     * Registra la entrega de un premio a un ganador específico.
     *
     * @param int $ganadorId ID del registro en la tabla 'ganadores'
     * @param array $data Datos de entrega (dni_receptor, nombre_receptor, observaciones)
     * @param UploadedFile|null $fotoEvidencia
     * @return EntregaPremio
     * @throws Exception
     */
    public static function execute(int $ganadorId, array $data, ?UploadedFile $fotoEvidencia = null): EntregaPremio
    {
        $ganador = Ganador::findOrFail($ganadorId);

        // Verificar si ya se entregó el premio para este cartón/posición
        // (Aunque la tabla entregas_premios tiene UNIQUE en ganador_id, validamos lógica de negocio)
        if ($ganador->entregaPremio) {
            throw new Exception("El premio para este ganador ya ha sido entregado.");
        }

        // Subir foto si existe
        $fotoPath = null;
        if ($fotoEvidencia) {
            $path = $fotoEvidencia->store('evidencia_entregas', 'public');
            if (!$path) {
                throw new Exception("Error al guardar la foto de evidencia.");
            }
            $fotoPath = $path;
        }

        DB::beginTransaction();

        try {
            $entrega = EntregaPremio::create([
                'ganador_id' => $ganadorId,
                'fecha_entrega' => now(),
                'dni_receptor' => $data['dni_receptor'] ?? $ganador->inscripto->dni,
                'nombre_receptor' => $data['nombre_receptor'] ?? $ganador->inscripto->full_name,
                'observaciones' => $data['observaciones'] ?? null,
                'foto_evidencia_path' => $fotoPath,
            ]);

            DB::commit();

            return $entrega;
        } catch (Exception $e) {
            DB::rollBack();
            // Si falla, borrar la foto subida para no dejar basura
            if ($fotoPath) {
                Storage::disk('public')->delete($fotoPath);
            }
            throw $e;
        }
    }
}
