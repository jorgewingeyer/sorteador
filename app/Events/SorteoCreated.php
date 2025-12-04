<?php

namespace App\Events;

use App\Http\Resources\SorteoResource;
use App\Models\Sorteo;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SorteoCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @var array<string,mixed> */
    public array $sorteo;

    public function __construct(Sorteo $sorteo)
    {
        $this->sorteo = (new SorteoResource($sorteo))->toArray(request());
    }

    public function broadcastOn(): Channel
    {
        return new Channel('sorteos');
    }

    public function broadcastAs(): string
    {
        return 'SorteoCreated';
    }
}
