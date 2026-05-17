<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activite;
use App\Models\Consultation;
use App\Models\Document;
use App\Models\Medecin;
use App\Models\Patient;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'nombre_patients' => Patient::count(),
            'nombre_medecins' => Medecin::count(),
            'nombre_documents' => Document::count(),
            'nombre_consultations' => Consultation::count(),
            'activite_recente' => Activite::with('user')->latest('date_action')->limit(10)->get(),
            'documents_par_type' => Document::selectRaw('id_type, count(*) as total')
                ->with('type')
                ->groupBy('id_type')
                ->get(),
            'consultations_mensuelles' => Consultation::selectRaw('YEAR(date_consultation) as annee, MONTH(date_consultation) as mois, count(*) as total')
                ->groupBy('annee', 'mois')
                ->orderBy('annee')
                ->orderBy('mois')
                ->get(),
        ]);
    }
}
