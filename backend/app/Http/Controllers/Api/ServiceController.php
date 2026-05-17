<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::withCount(['medecins', 'factures'])->orderBy('nom_service')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_service' => ['required', 'string', 'max:150', 'unique:service,nom_service'],
            'description' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'emplacement' => ['nullable', 'string', 'max:100'],
            'statut' => ['nullable', Rule::in(['actif', 'inactif'])],
        ]);

        return response()->json(Service::create($data), 201);
    }

    public function show(Service $service)
    {
        return $service->load(['medecins.user']);
    }

    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'nom_service' => ['sometimes', 'string', 'max:150', Rule::unique('service', 'nom_service')->ignore($service->id_service, 'id_service')],
            'description' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'emplacement' => ['nullable', 'string', 'max:100'],
            'statut' => ['sometimes', Rule::in(['actif', 'inactif'])],
        ]);

        $service->update($data);

        return $service;
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return response()->json(['message' => 'Service supprime.']);
    }
}
