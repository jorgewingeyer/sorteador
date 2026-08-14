<?php

namespace App\Jobs;

use App\Actions\Participantes\Transformers\CsvParticipanteTransformer;
use App\Actions\Participantes\Validators\ParticipanteRowValidator;
use App\Models\ImportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessCsvChunk implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param  array<int, array<string, string|null>>  $chunk
     */
    public function __construct(
        public array $chunk,
        public int $sorteoId,
        public int $importLogId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $batch = [];
        $failed = 0;
        $now = now();
        $duplicatesInChunk = 0;
        $debugEntries = [];
        $firstSeenByKey = [];

        foreach ($this->chunk as $row) {
            try {
                // Transform row using the existing Transformer logic which handles sanitization and mapping
                $mapped = CsvParticipanteTransformer::execute($row, $this->sorteoId);

                $validation = ParticipanteRowValidator::execute($mapped);

                if (! $validation['valid']) {
                    $failed++;
                    $debugEntries[] = [
                        'type' => 'validation',
                        'line' => (int) ($row['_source_line'] ?? 0),
                        'error' => implode(' | ', $validation['errors']),
                    ];

                    continue;
                }

                $mapped['created_at'] = $now;
                $mapped['updated_at'] = $now;
                $compositeKey = implode('|', [
                    (string) $mapped['sorteo_id'],
                    (string) $mapped['dni'],
                    (string) $mapped['carton_number'],
                ]);

                if (isset($firstSeenByKey[$compositeKey])) {
                    $duplicatesInChunk++;
                    $debugEntries[] = [
                        'type' => 'duplicate',
                        'line' => (int) ($row['_source_line'] ?? 0),
                        'original_line' => (int) $firstSeenByKey[$compositeKey]['line'],
                        'error' => 'Registro duplicado dentro del mismo bloque.',
                        'match' => [
                            'sorteo_id' => $mapped['sorteo_id'],
                            'dni' => $mapped['dni'],
                            'carton_number' => $mapped['carton_number'],
                        ],
                    ];

                    continue;
                }

                $firstSeenByKey[$compositeKey] = [
                    'line' => (int) ($row['_source_line'] ?? 0),
                ];
                $batch[] = $mapped;
            } catch (\Throwable $e) {
                $failed++;
                $debugEntries[] = [
                    'type' => 'exception',
                    'line' => (int) ($row['_source_line'] ?? 0),
                    'error' => $e->getMessage(),
                ];
            }
        }

        $insertedCount = 0;
        if (! empty($batch)) {

            try {
                // Contar antes para calcular nuevos registros reales
                $countBefore = DB::table('inscriptos')
                    ->where('sorteo_id', $this->sorteoId)
                    ->count();

                // Upsert: inserta nuevos registros O actualiza import_log_id en los existentes.
                // Esto marca todos los registros presentes en este CSV como "vistos en este import",
                // permitiendo excluir participantes de imports anteriores que ya no están en el padrón.
                $batchWithLog = array_map(
                    fn ($row) => array_merge($row, ['import_log_id' => $this->importLogId]),
                    $batch
                );

                DB::table('inscriptos')->upsert(
                    $batchWithLog,
                    ['sorteo_id', 'dni', 'carton_number'],
                    ['import_log_id', 'updated_at']
                );

                $insertedCount = DB::table('inscriptos')
                    ->where('sorteo_id', $this->sorteoId)
                    ->count() - $countBefore;
            } catch (\Throwable $e) {
                Log::error('Database insert failed in job', ['error' => $e->getMessage()]);
                throw $e; // Retry job
            }
        }

        // Update import log
        try {
            $log = ImportLog::find($this->importLogId);
            if ($log) {
                $log->increment('imported_rows', $insertedCount);
                $alreadyExistedInDb = max(count($batch) - $insertedCount, 0);
                $log->increment('skipped_rows', $failed + $duplicatesInChunk + $alreadyExistedInDb);

                if (! empty($debugEntries)) {
                    $existingEntries = is_array($log->error_log) ? $log->error_log : [];
                    $log->forceFill([
                        'error_log' => array_merge($existingEntries, $debugEntries),
                    ])->save();
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to update import log', ['error' => $e->getMessage()]);
        }
    }
}
