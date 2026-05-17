<?php

namespace Database\Seeders;

use App\Models\Activite;
use App\Models\Consultation;
use App\Models\Document;
use App\Models\Medecin;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\TypeDocument;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class HospitalScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $coordinator = User::updateOrCreate(
            ['email' => 'coordinateur@medarchive.test'],
            [
                'nom_complet' => 'Coordinateur Archives',
                'password' => 'password',
                'role' => 'admin',
                'statut' => 'actif',
            ],
        );

        $cardiologistUser = User::updateOrCreate(
            ['email' => 'samir.naciri@medarchive.test'],
            [
                'nom_complet' => 'Dr. Samir Naciri',
                'password' => 'password',
                'role' => 'medecin',
                'statut' => 'actif',
            ],
        );

        $radiologistUser = User::updateOrCreate(
            ['email' => 'hiba.raji@medarchive.test'],
            [
                'nom_complet' => 'Dr. Hiba Raji',
                'password' => 'password',
                'role' => 'medecin',
                'statut' => 'actif',
            ],
        );

        $cardiologist = Medecin::updateOrCreate(
            ['id_user' => $cardiologistUser->id_user],
            [
                'specialite' => 'Cardiologie interventionnelle',
                'numero_bureau' => 'C-310',
                'telephone_professionnel' => '0522443301',
            ],
        );

        $radiologist = Medecin::updateOrCreate(
            ['id_user' => $radiologistUser->id_user],
            [
                'specialite' => 'Radiologie',
                'numero_bureau' => 'R-205',
                'telephone_professionnel' => '0522443302',
            ],
        );

        $patientUser = User::updateOrCreate(
            ['email' => 'imane.elalami@medarchive.test'],
            [
                'nom_complet' => 'Imane El Alami',
                'password' => 'password',
                'role' => 'patient',
                'statut' => 'actif',
            ],
        );

        $patient = Patient::updateOrCreate(
            ['ip_patient' => '20260005'],
            [
                'id_user' => $patientUser->id_user,
                'cin' => 'IA2026001',
                'telephone' => '0667788990',
                'date_naissance' => '1990-05-14',
                'sexe' => 'femme',
                'adresse' => 'Residence Al Massira, Casablanca',
                'groupe_sanguin' => 'O-',
                'contact_urgence' => 'Omar El Alami - 0661122455',
            ],
        );

        $initialConsultation = Consultation::updateOrCreate(
            [
                'id_patient' => $patient->id_patient,
                'id_medecin' => $cardiologist->id_medecin,
                'date_consultation' => now()->subDays(12)->setTime(9, 20),
            ],
            [
                'diagnostic' => 'Douleurs thoraciques avec suspicion de trouble du rythme',
                'notes' => 'Patient admis apres douleurs thoraciques nocturnes. ECG et bilan sanguin demandes.',
                'traitement' => 'Surveillance cardiaque, repos, controle tensionnel et examens complementaires.',
            ],
        );

        $radiologyConsultation = Consultation::updateOrCreate(
            [
                'id_patient' => $patient->id_patient,
                'id_medecin' => $radiologist->id_medecin,
                'date_consultation' => now()->subDays(10)->setTime(14, 10),
            ],
            [
                'diagnostic' => 'Controle radiologique sans anomalie pulmonaire majeure',
                'notes' => 'Radiographie thoracique realisee pour eliminer une cause pulmonaire.',
                'traitement' => 'Compte rendu transmis au cardiologue.',
            ],
        );

        $followUpConsultation = Consultation::updateOrCreate(
            [
                'id_patient' => $patient->id_patient,
                'id_medecin' => $cardiologist->id_medecin,
                'date_consultation' => now()->subDays(4)->setTime(11, 45),
            ],
            [
                'diagnostic' => 'Etat clinique stable apres traitement',
                'notes' => 'Douleurs diminuees, bilan sanguin rassurant. Poursuite du suivi externe.',
                'traitement' => 'Traitement cardiologique leger pendant 30 jours et controle dans un mois.',
            ],
        );

        $types = TypeDocument::all()->keyBy('nom_type');
        Storage::makeDirectory('documents');

        $documents = [
            [
                'type' => 'Analyse',
                'consultation' => $initialConsultation,
                'doctor' => $cardiologist,
                'titre' => 'Bilan sanguin admission - Imane El Alami',
                'file' => 'scenario-bilan-sanguin-imane.pdf',
                'statut' => 'actif',
                'description' => 'Troponine, NFS, CRP et ionogramme demandes lors de l admission.',
            ],
            [
                'type' => 'Radio',
                'consultation' => $radiologyConsultation,
                'doctor' => $radiologist,
                'titre' => 'Radio thorax de controle - Imane El Alami',
                'file' => 'scenario-radio-thorax-imane.pdf',
                'statut' => 'actif',
                'description' => 'Compte rendu radiologique associe a la consultation de radiologie.',
            ],
            [
                'type' => 'Ordonnance',
                'consultation' => $followUpConsultation,
                'doctor' => $cardiologist,
                'titre' => 'Ordonnance sortie cardiologie - Imane El Alami',
                'file' => 'scenario-ordonnance-sortie-imane.pdf',
                'statut' => 'actif',
                'description' => 'Traitement de sortie et recommandations de suivi.',
            ],
            [
                'type' => 'Rapport medical',
                'consultation' => $followUpConsultation,
                'doctor' => $cardiologist,
                'titre' => 'Rapport medical de synthese - Imane El Alami',
                'file' => 'scenario-rapport-synthese-imane.pdf',
                'statut' => 'archive',
                'description' => 'Synthese du passage hospitalier et archivage administratif.',
            ],
        ];

        foreach ($documents as $document) {
            $path = 'documents/'.$document['file'];

            if (! Storage::exists($path)) {
                Storage::put(
                    $path,
                    "MedArchive - Scenario hospitalier\n".
                    "Patient: Imane El Alami\n".
                    "Document: {$document['titre']}\n".
                    "Description: {$document['description']}\n",
                );
            }

            Document::updateOrCreate(
                ['nom_fichier' => $document['file']],
                [
                    'id_patient' => $patient->id_patient,
                    'id_medecin' => $document['doctor']->id_medecin,
                    'id_consultation' => $document['consultation']->id_consultation,
                    'id_type' => $types[$document['type']]->id_type,
                    'titre' => $document['titre'],
                    'description' => $document['description'],
                    'chemin_fichier' => $path,
                    'taille_fichier' => Storage::size($path),
                    'statut' => $document['statut'],
                ],
            );
        }

        foreach ([
            'Votre bilan sanguin est disponible dans votre espace patient.',
            'Votre compte rendu de radiologie a ete ajoute.',
            'Votre ordonnance de sortie est disponible au telechargement.',
        ] as $message) {
            Notification::updateOrCreate(
                ['id_user' => $patientUser->id_user, 'message' => $message],
                ['lu' => false],
            );
        }

        foreach ([
            ['action' => 'Admission patient', 'description' => 'Creation du scenario hospitalier Imane El Alami.'],
            ['action' => 'Consultation cardiologie', 'description' => 'Suivi cardiologique et examens complementaires.'],
            ['action' => 'Archivage dossier', 'description' => 'Rapport medical de synthese archive.'],
        ] as $activity) {
            Activite::updateOrCreate(
                ['id_user' => $coordinator->id_user, 'action' => $activity['action']],
                ['description' => $activity['description']],
            );
        }
    }
}
