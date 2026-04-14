<?php

namespace App\Contracts;

interface RandomizerContract
{
    public function randomInt(int $min, int $max): int;
}
