<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::with('user');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ip_patient', 'like', "%{$search}%")
                    ->orWhere('cin', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery->where('nom_complet', 'like', "%{$search}%"));
            });
        }

        return $query->latest('id_patient')->paginate(10);
    }

    public function store(StorePatientRequest $request)
    {
        $data = $request->validated();

        return response()->json(Patient::create($data)->load('user'), 201);
    }

    public function show(Patient $patient)
    {
        return $patient->load(['user', 'consultations.medecin.user', 'documents.type']);
    }

    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $data = $request->validated();

        $patient->update($data);

        return $patient->load('user');
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json(['message' => 'Patient supprime.']);
    }
}
