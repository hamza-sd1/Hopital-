<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsultationRequest;
use App\Http\Requests\UpdateConsultationRequest;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        $query = Consultation::with(['patient.user', 'medecin.user', 'service', 'facture']);
        $this->applyUserScope($request, $query);

        foreach (['id_patient', 'id_medecin'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->query($field));
            }
        }

        return $query->latest('date_consultation')->paginate(10);
    }

    public function store(StoreConsultationRequest $request)
    {
        $data = $request->validated();

        if ($request->user()->role === 'medecin') {
            $data['id_medecin'] = $request->user()->medecin?->id_medecin;
            abort_unless($data['id_medecin'], 403, 'Profil medecin introuvable.');
        }

        return response()->json(Consultation::create($data)->load(['patient.user', 'medecin.user', 'service']), 201);
    }

    public function show(Consultation $consultation)
    {
        $this->authorizeConsultation($consultation);

        return $consultation->load(['patient.user', 'medecin.user', 'service', 'documents.type']);
    }

    public function update(UpdateConsultationRequest $request, Consultation $consultation)
    {
        $this->authorizeConsultation($consultation);

        $data = $request->validated();

        $consultation->update($data);

        return $consultation->load(['patient.user', 'medecin.user', 'service']);
    }

    public function destroy(Consultation $consultation)
    {
        abort_if(request()->user()->role === 'patient', 403, 'Acces non autorise.');
        $this->authorizeConsultation($consultation);

        $consultation->delete();

        return response()->json(['message' => 'Consultation supprimee.']);
    }

    private function applyUserScope(Request $request, $query): void
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $query->where('id_patient', $user->patient?->id_patient ?? 0);
        }

        if ($user->role === 'medecin') {
            $query->where('id_medecin', $user->medecin?->id_medecin ?? 0);
        }
    }

    private function authorizeConsultation(Consultation $consultation): void
    {
        $user = request()->user();

        if (in_array($user->role, ['admin', 'facturation'], true)) {
            return;
        }

        if ($user->role === 'patient' && $consultation->id_patient === $user->patient?->id_patient) {
            return;
        }

        if ($user->role === 'medecin' && $consultation->id_medecin === $user->medecin?->id_medecin) {
            return;
        }

        abort(403, 'Acces non autorise.');
    }
}
