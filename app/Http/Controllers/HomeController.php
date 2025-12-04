<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('welcome/welcome', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }
}
