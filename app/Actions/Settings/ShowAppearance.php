<?php

namespace App\Actions\Settings;

use App\Actions\Action;
use Inertia\Inertia;
use Inertia\Response;

class ShowAppearance extends Action
{
    public static function execute(): Response
    {
        return Inertia::render('settings/appearance');
    }
}
