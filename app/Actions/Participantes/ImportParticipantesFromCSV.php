<?php

namespace App\Actions\Participantes;

use App\Actions\Action;
use App\Actions\Participantes\Transformers\CsvParticipanteTransformer;
use App\Jobs\ProcessCsvChunk;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

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
                $hNorm = strtolower($h);
                // normalize special headers
                $hNorm = str_replace([' ', '.', 'ó'], ['_', '', 'o'], $hNorm);

                return $hNorm;
            }, $rawHeaders);
            Log::info('CSV import headers detected', ['headers' => $headers, 'delimiter' => $delimiter]);

            $line = 1;
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {

                $processed++;
                $assoc = [];
                foreach ($headers as $idx => $header) {
                    $assoc[$header] = isset($row[$idx]) ? (string) $row[$idx] : null;
                }

                // Transform immediately to ensure UTF-8 encoding before dispatching
                $mapped = CsvParticipanteTransformer::execute($assoc, $sorteoId);
                $batch[] = $mapped;
                
                if (count($batch) >= self::CHUNK_SIZE) {
                    ProcessCsvChunk::dispatch($batch, $sorteoId);
                    $chunks++;
                    $batch = [];
                }
            }

            if (! empty($batch)) {
                ProcessCsvChunk::dispatch($batch, $sorteoId);
                $chunks++;
            }
        } catch (\Throwable $e) {
            Log::error('CSV import failure', [
                'message' => $e->getMessage(),
            ]);
            $errors[] = ['line' => $processed + 1, 'error' => $e->getMessage()];
        } finally {
            fclose($handle);
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
