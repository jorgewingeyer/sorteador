<?php

namespace App\Providers;

use App\Contracts\RandomizerContract;
use App\Services\Randomizer\CryptographicRandomizer;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(RandomizerContract::class, CryptographicRandomizer::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
