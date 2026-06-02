<?php

namespace Database\Seeders;

use App\Models\Activite;
use App\Models\Consultation;
use App\Models\Facture;
use App\Models\Medecin;
use App\Models\Message;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class BillingScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $billingUser = User::updateOrCreate(
            ['email' => 'facturation@medarchive.test'],
            [
                'nom_complet' => 'Service Facturation',
                'password' => 'password',
                'role' => 'facturation',
                'statut' => 'actif',
            ],
        );

        $services = collect([
            ['nom_service' => 'Cardiologie', 'description' => 'Consultations et suivi cardiaque.', 'telephone' => '0522443301', 'emplacement' => 'Bloc C - Etage 3'],
            ['nom_service' => 'Radiologie', 'description' => 'Examens radiologiques et imagerie medicale.', 'telephone' => '0522443302', 'emplacement' => 'Bloc R - Etage 2'],
            ['nom_service' => 'Laboratoire', 'description' => 'Analyses medicales et prelevements.', 'telephone' => '0522443303', 'emplacement' => 'Bloc L - RDC'],
            ['nom_service' => 'Facturation', 'description' => 'Suivi des paiements patients.', 'telephone' => '0522443399', 'emplacement' => 'Administration'],
        ])->map(fn ($service) => Service::updateOrCreate(['nom_service' => $service['nom_service']], [...$service, 'statut' => 'actif']));

        Medecin::with('user')->get()->each(function (Medecin $medecin) use ($services) {
            $specialite = strtolower($medecin->specialite ?? '');
            $serviceName = str_contains($specialite, 'radio') ? 'Radiologie' : 'Cardiologie';
            $medecin->update(['id_service' => $services->firstWhere('nom_service', $serviceName)?->id_service]);
        });

        Consultation::with('medecin')->get()->each(function (Consultation $consultation) {
            $consultation->update(['id_service' => $consultation->medecin?->id_service]);
        });

        $patients = Patient::with(['user', 'consultations'])->take(5)->get();

        foreach ($patients as $index => $patient) {
            $consultation = $patient->consultations->first();

            if (! $consultation) {
                continue;
            }

            $status = $index % 3 === 0 ? 'payee' : ($index % 3 === 1 ? 'non_payee' : 'partiellement_payee');

            $facture = Facture::updateOrCreate(
                ['reference' => 'FAC-2026-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT)],
                array_filter([
                    'id_patient' => Schema::hasColumn('facture', 'id_patient') ? $patient->id_patient : null,
                    'id_consultation' => $consultation->id_consultation,
                    'montant' => [350, 500, 780, 1200, 260][$index] ?? 300,
                    'statut_paiement' => $status,
                    'date_facture' => now()->subDays(9 - $index)->toDateString(),
                    'date_paiement' => $status === 'payee' ? now()->subDays(2)->toDateString() : null,
                    'notes' => $status === 'non_payee' ? 'Paiement en attente.' : 'Facture de demonstration.',
                ], fn ($value) => $value !== null),
            );

            if ($status !== 'payee') {
                Message::updateOrCreate(
                    ['id_facture' => $facture->id_facture, 'sujet' => 'Rappel de paiement'],
                    [
                        'id_expediteur' => $billingUser->id_user,
                        'id_destinataire' => $patient->id_user,
                        'contenu' => "Votre facture {$facture->reference} n est pas encore totalement payee. Merci de contacter le service facturation.",
                        'lu' => false,
                    ],
                );
            }
        }

        Activite::updateOrCreate(
            ['id_user' => $billingUser->id_user, 'action' => 'Creation factures demo'],
            ['description' => 'Factures et rappels de paiement generes pour les tests.'],
        );
    }
}
