<?php

namespace App\Jobs;

use App\Actions\Participantes\Validators\ParticipanteRowValidator;
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
     * @param array<int, array<string, string|null>> $chunk
     */
    public function __construct(
        public array $chunk,
        public int $sorteoId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $batch = [];
        $failed = 0;
        $now = now();

        foreach ($this->chunk as $mapped) {
            try {
                $validation = ParticipanteRowValidator::execute($mapped);

                if (! $validation['valid']) {
                    $failed++;
                    continue;
                }

                $mapped['created_at'] = $now;
                $mapped['updated_at'] = $now;
                $batch[] = $mapped;
            } catch (\Throwable $e) {
                $failed++;
                Log::error('Error processing CSV row in job', ['error' => $e->getMessage(), 'row' => $mapped]);
            }
        }

        if (! empty($batch)) {
            DB::table('participantes')->insert($batch);
        }

        Log::info('CSV Chunk processed', [
            'inserted' => count($batch),
            'failed' => $failed,
            'sorteo_id' => $this->sorteoId,
        ]);
    }
}
