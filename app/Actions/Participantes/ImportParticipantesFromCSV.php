<?php

namespace App\Actions\Participantes;

use App\Actions\Action;
use App\Actions\Participantes\Transformers\CsvParticipanteTransformer;
use App\Jobs\ProcessCsvChunk;
use App\Models\ImportLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * ImportParticipantesFromCSV
 *
 * Streams a CSV file, transforms rows, validates, and inserts in chunks.
 */
abstract class ImportParticipantesFromCSV extends Action
{
    /** @var int */
    private const CHUNK_SIZE = 1000;

    /** @var int */
    private const ERROR_LIMIT = 200;

    /**
     * @return array{status:string,imported:int,failed:int,processed:int,chunks:int,errors:array<int,array<string,mixed>>}
     */
    public static function execute(UploadedFile $file, int $sorteoId): array
    {
        $path = $file->getRealPath();
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();

        if ($path === false) {
            return [
                'status' => 'error',
                'imported' => 0,
                'failed' => 0,
                'processed' => 0,
                'chunks' => 0,
                'errors' => [
                    ['line' => 0, 'error' => 'No se pudo acceder al archivo subido.'],
                ],
            ];
        }

        $handle = fopen($path, 'rb');
        if ($handle === false) {
            return [
                'status' => 'error',
                'imported' => 0,
                'failed' => 0,
                'processed' => 0,
                'chunks' => 0,
                'errors' => [
                    ['line' => 0, 'error' => 'No se pudo abrir el archivo CSV.'],
                ],
            ];
        }

        $imported = 0;
        $failed = 0;
        $processed = 0;
        $chunks = 0;
        $errors = [];

        $headers = [];
        $batch = [];

        // Create initial log entry
        $importLog = ImportLog::create([
            'sorteo_id' => $sorteoId,
            'file_name' => @mb_convert_encoding($fileName, 'UTF-8', 'UTF-8, ISO-8859-1'),
            'file_size' => $fileSize,
            'total_rows' => 0, // Will be updated
            'imported_rows' => 0,
            'skipped_rows' => 0,
            'error_log' => [],
            'user_id' => Auth::id(),
        ]);

        try {
            // Detect delimiter from header line
            $headerLine = fgets($handle);
            if ($headerLine === false) {
                throw new \RuntimeException('El archivo CSV está vacío o es ilegible.');
            }
            // Strip UTF-8 BOM if present
            if (strncmp($headerLine, "\xEF\xBB\xBF", 3) === 0) {
                $headerLine = substr($headerLine, 3);
            }
            $semicolonCount = substr_count($headerLine, ';');
            $commaCount = substr_count($headerLine, ',');
            $delimiter = $semicolonCount > $commaCount ? ';' : ',';

            $rawHeaders = str_getcsv(rtrim($headerLine, "\r\n"), $delimiter);
            $headers = array_map(function ($h) {
                $h = is_string($h) ? trim($h) : '';
                // Ensure UTF-8
                $h = @mb_convert_encoding($h, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
                $hNorm = mb_strtolower($h, 'UTF-8');
                // normalize special headers
                $hNorm = str_replace(
                    [' ', '.', 'ó', 'á', 'é', 'í', 'ú', 'ñ'], 
                    ['_', '', 'o', 'a', 'e', 'i', 'u', 'n'], 
                    $hNorm
                );

                return $hNorm;
            }, $rawHeaders);
            Log::info('CSV import headers detected', ['headers' => $headers, 'delimiter' => $delimiter]);

            $line = 1;
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {

                $processed++;
                $assoc = [];
                foreach ($headers as $idx => $header) {
                    $value = isset($row[$idx]) ? (string) $row[$idx] : null;
                    // Ensure value is UTF-8
                    if ($value !== null) {
                        $value = @mb_convert_encoding($value, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
                    }
                    $assoc[$header] = $value;
                }

                // Transform row data using CsvParticipanteTransformer
                // Note: We need to adapt CsvParticipanteTransformer to return an array
                // For now, let's assume raw data is passed to the job which handles validation/mapping
                $batch[] = $assoc;
                $imported++;
                
                if (count($batch) >= self::CHUNK_SIZE) {
                    ProcessCsvChunk::dispatchSync($batch, $sorteoId, $importLog->id);
                    $chunks++;
                    $batch = [];
                }
            }

            if (! empty($batch)) {
                ProcessCsvChunk::dispatchSync($batch, $sorteoId, $importLog->id);
                $chunks++;
            }
        } catch (\Throwable $e) {
            // Ensure error message is UTF-8 encoded
            $errorMessage = @mb_convert_encoding($e->getMessage(), 'UTF-8', 'UTF-8, ISO-8859-1');
            Log::error('CSV import failure', [
                'message' => $errorMessage,
            ]);
            $errors[] = ['line' => $processed + 1, 'error' => $errorMessage];
        } finally {
            fclose($handle);
            
            // Update import log with totals
            $importLog->update([
                'total_rows' => $processed,
                'error_log' => $errors,
            ]);
        }

        return [
            'status' => 'ok',
            'imported' => 0, // Processing in background
            'failed' => 0,   // Processing in background
            'processed' => $processed,
            'chunks' => $chunks,
            'errors' => $errors,
        ];
    }
}
