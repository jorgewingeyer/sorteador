<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\ShowAppearance;
use App\Http\Controllers\Controller;
use Inertia\Response;

class AppearanceController extends Controller
{
    public function edit(): Response
    {
        return ShowAppearance::execute();
    }
}
