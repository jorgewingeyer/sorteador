<?php

namespace App\Http\Controllers;

use App\Actions\Premios\CreatePremio;
use App\Http\Requests\Premio\StoreRequest;
use Illuminate\Http\RedirectResponse;
use App\Actions\Premios\GetAllPremios;
use App\Http\Resources\Premios\PremioResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PremioController extends Controller
{
    public function index()
    {
        $premios = GetAllPremios::execute();
        
        return Inertia::render('premios/premios', [
            'premios' => PremioResource::collection($premios),
        ]); 
    }

    public function store(StoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        CreatePremio::execute($data);

        return redirect()->route('premios')->with('success', 'Premio creado correctamente.');
    }
}
