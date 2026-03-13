<?php

namespace App\Enums;

enum InstanciaStatus: string
{
    case Pendiente = 'pendiente';
    case Finalizada = 'finalizada';

    public function label(): string
    {
        return match($this) {
            self::Pendiente => 'Pendiente',
            self::Finalizada => 'Finalizada',
        };
    }
}
