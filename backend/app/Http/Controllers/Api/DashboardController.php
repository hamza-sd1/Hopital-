<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activite;
use App\Models\Consultation;
use App\Models\Document;
use App\Models\Medecin;
use App\Models\Patient;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $patientId = $user->patient?->id_patient;
        $medecinId = $user->medecin?->id_medecin;

        $documentsQuery = Document::query();
        $consultationsQuery = Consultation::query();

        if ($user->role === 'patient') {
            $documentsQuery->where('id_patient', $patientId ?? 0);
            $consultationsQuery->where('id_patient', $patientId ?? 0);
        }

        if ($user->role === 'medecin') {
            $documentsQuery->where('id_medecin', $medecinId ?? 0);
            $consultationsQuery->where('id_medecin', $medecinId ?? 0);
        }

        $patientsCount = match ($user->role) {
            'admin' => Patient::count(),
            'patient' => $patientId ? 1 : 0,
            'medecin' => (clone $consultationsQuery)->distinct('id_patient')->count('id_patient'),
            default => 0,
        };

        $medecinsCount = match ($user->role) {
            'admin' => Medecin::count(),
            'medecin' => $medecinId ? 1 : 0,
            'patient' => (clone $consultationsQuery)->distinct('id_medecin')->count('id_medecin'),
            default => 0,
        };

        return response()->json([
            'nombre_patients' => $patientsCount,
            'nombre_medecins' => $medecinsCount,
            'nombre_documents' => (clone $documentsQuery)->count(),
            'nombre_consultations' => (clone $consultationsQuery)->count(),
            'activite_recente' => $user->role === 'admin'
                ? Activite::with('user')->latest('date_action')->limit(10)->get()
                : [],
            'documents_par_type' => (clone $documentsQuery)->selectRaw('id_type, count(*) as total')
                ->with('type')
                ->groupBy('id_type')
                ->get(),
            'consultations_mensuelles' => (clone $consultationsQuery)->selectRaw('YEAR(date_consultation) as annee, MONTH(date_consultation) as mois, count(*) as total')
                ->groupBy('annee', 'mois')
                ->orderBy('annee')
                ->orderBy('mois')
                ->get(),
        ]);
    }
}
