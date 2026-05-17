<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMedecinRequest;
use App\Http\Requests\UpdateMedecinRequest;
use App\Models\Medecin;

class MedecinController extends Controller
{
    public function index()
    {
        return Medecin::with(['user', 'service'])->latest('id_medecin')->paginate(10);
    }

    public function store(StoreMedecinRequest $request)
    {
        $data = $request->validated();

        return response()->json(Medecin::create($data)->load(['user', 'service']), 201);
    }

    public function show(Medecin $medecin)
    {
        return $medecin->load(['user', 'service', 'consultations.patient.user']);
    }

    public function update(UpdateMedecinRequest $request, Medecin $medecin)
    {
        $data = $request->validated();

        $medecin->update($data);

        return $medecin->load(['user', 'service']);
    }

    public function destroy(Medecin $medecin)
    {
        $medecin->delete();

        return response()->json(['message' => 'Medecin supprime.']);
    }
}
