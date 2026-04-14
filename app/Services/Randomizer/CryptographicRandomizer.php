<?php

namespace App\Services\Randomizer;

use App\Contracts\RandomizerContract;

class CryptographicRandomizer implements RandomizerContract
{
    public function randomInt(int $min, int $max): int
    {
        return random_int($min, $max);
    }
}
