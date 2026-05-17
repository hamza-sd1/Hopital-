<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FactureController extends Controller
{
    public function index(Request $request)
    {
        $query = Facture::with(['patient.user', 'consultation.medecin.user', 'service'])->latest('id_facture');
        $user = $request->user();

        if ($user->role === 'patient') {
            $query->where('id_patient', $user->patient?->id_patient ?? 0);
        }

        if ($request->filled('statut_paiement')) {
            $query->where('statut_paiement', $request->query('statut_paiement'));
        }

        return $query->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_patient' => ['required', 'exists:patient,id_patient'],
            'id_consultation' => ['nullable', 'exists:consultation,id_consultation'],
            'id_service' => ['nullable', 'exists:service,id_service'],
            'reference' => ['nullable', 'string', 'max:80', 'unique:facture,reference'],
            'montant' => ['required', 'numeric', 'min:0'],
            'statut_paiement' => ['nullable', Rule::in(['non_payee', 'payee', 'partiellement_payee', 'annulee'])],
            'date_facture' => ['required', 'date'],
            'date_paiement' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['reference'] ??= 'FAC-'.now()->format('YmdHis').'-'.random_int(100, 999);

        return response()->json(Facture::create($data)->load(['patient.user', 'service']), 201);
    }

    public function show(Facture $facture)
    {
        $this->authorizeFacture($facture);

        return $facture->load(['patient.user', 'consultation.medecin.user', 'service', 'messages']);
    }

    public function update(Request $request, Facture $facture)
    {
        $data = $request->validate([
            'id_service' => ['sometimes', 'nullable', 'exists:service,id_service'],
            'montant' => ['sometimes', 'numeric', 'min:0'],
            'statut_paiement' => ['sometimes', Rule::in(['non_payee', 'payee', 'partiellement_payee', 'annulee'])],
            'date_facture' => ['sometimes', 'date'],
            'date_paiement' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $facture->update($data);

        return $facture->load(['patient.user', 'service']);
    }

    public function destroy(Facture $facture)
    {
        $facture->delete();

        return response()->json(['message' => 'Facture supprimee.']);
    }

    public function sendReminder(Request $request, Facture $facture)
    {
        abort_if($facture->statut_paiement === 'payee', 422, 'Cette facture est deja payee.');

        $message = Message::create([
            'id_expediteur' => $request->user()->id_user,
            'id_destinataire' => $facture->patient->id_user,
            'id_facture' => $facture->id_facture,
            'sujet' => 'Rappel de paiement',
            'contenu' => "Votre facture {$facture->reference} d un montant de {$facture->montant} DH n est pas encore payee.",
        ]);

        return response()->json($message->load(['destinataire', 'facture']), 201);
    }

    private function authorizeFacture(Facture $facture): void
    {
        $user = request()->user();

        if (in_array($user->role, ['admin', 'facturation'], true)) {
            return;
        }

        if ($user->role === 'patient' && $facture->id_patient === $user->patient?->id_patient) {
            return;
        }

        abort(403, 'Acces non autorise.');
    }
}
