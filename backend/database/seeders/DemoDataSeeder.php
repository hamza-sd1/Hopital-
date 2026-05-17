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

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@medarchive.test'],
            [
                'nom_complet' => 'Administrateur MedArchive',
                'password' => 'password',
                'role' => 'admin',
                'statut' => 'actif',
            ],
        );

        $doctors = [
            [
                'user' => ['nom_complet' => 'Dr. Mehdi Alaoui', 'email' => 'mehdi.alaoui@medarchive.test'],
                'profile' => ['specialite' => 'Cardiologie', 'numero_bureau' => 'B-204', 'telephone_professionnel' => '0522001101'],
            ],
            [
                'user' => ['nom_complet' => 'Dr. Lina Tazi', 'email' => 'lina.tazi@medarchive.test'],
                'profile' => ['specialite' => 'Radiologie', 'numero_bureau' => 'R-112', 'telephone_professionnel' => '0522001102'],
            ],
            [
                'user' => ['nom_complet' => 'Dr. Amine Mansouri', 'email' => 'amine.mansouri@medarchive.test'],
                'profile' => ['specialite' => 'Medecine generale', 'numero_bureau' => 'G-018', 'telephone_professionnel' => '0522001103'],
            ],
        ];

        $medecins = collect($doctors)->map(function (array $doctor) {
            $user = User::updateOrCreate(
                ['email' => $doctor['user']['email']],
                [
                    'nom_complet' => $doctor['user']['nom_complet'],
                    'password' => 'password',
                    'role' => 'medecin',
                    'statut' => 'actif',
                ],
            );

            return Medecin::updateOrCreate(
                ['id_user' => $user->id_user],
                $doctor['profile'],
            );
        });

        $patientsData = [
            [
                'user' => ['nom_complet' => 'Salma Amrani', 'email' => 'salma.amrani@medarchive.test'],
                'profile' => [
                    'ip_patient' => '20260001',
                    'cin' => 'AB123456',
                    'telephone' => '0612345678',
                    'date_naissance' => '1994-03-18',
                    'sexe' => 'femme',
                    'adresse' => 'Avenue Hassan II, Casablanca',
                    'groupe_sanguin' => 'O+',
                    'contact_urgence' => 'Mohamed Amrani - 0661122334',
                ],
            ],
            [
                'user' => ['nom_complet' => 'Youssef Bennis', 'email' => 'youssef.bennis@medarchive.test'],
                'profile' => [
                    'ip_patient' => '20260002',
                    'cin' => 'CD987654',
                    'telephone' => '0676543210',
                    'date_naissance' => '1988-11-02',
                    'sexe' => 'homme',
                    'adresse' => 'Quartier Agdal, Rabat',
                    'groupe_sanguin' => 'A-',
                    'contact_urgence' => 'Nadia Bennis - 0662233445',
                ],
            ],
            [
                'user' => ['nom_complet' => 'Nora El Idrissi', 'email' => 'nora.idrissi@medarchive.test'],
                'profile' => [
                    'ip_patient' => '20260003',
                    'cin' => 'EF456789',
                    'telephone' => '0601020304',
                    'date_naissance' => '2001-07-24',
                    'sexe' => 'femme',
                    'adresse' => 'Boulevard Mohammed V, Tanger',
                    'groupe_sanguin' => 'B+',
                    'contact_urgence' => 'Karim El Idrissi - 0663344556',
                ],
            ],
            [
                'user' => ['nom_complet' => 'Hamza El Fassi', 'email' => 'hamza.fassi@medarchive.test'],
                'profile' => [
                    'ip_patient' => '20260004',
                    'cin' => 'GH741852',
                    'telephone' => '0655443322',
                    'date_naissance' => '1979-01-09',
                    'sexe' => 'homme',
                    'adresse' => 'Route de Fes, Marrakech',
                    'groupe_sanguin' => 'AB+',
                    'contact_urgence' => 'Sara El Fassi - 0664455667',
                ],
            ],
        ];

        $patients = collect($patientsData)->map(function (array $patientData) {
            $user = User::updateOrCreate(
                ['email' => $patientData['user']['email']],
                [
                    'nom_complet' => $patientData['user']['nom_complet'],
                    'password' => 'password',
                    'role' => 'patient',
                    'statut' => 'actif',
                ],
            );

            return Patient::updateOrCreate(
                ['ip_patient' => $patientData['profile']['ip_patient']],
                ['id_user' => $user->id_user, ...$patientData['profile']],
            );
        });

        $consultations = collect([
            [
                'patient' => 0,
                'medecin' => 0,
                'date_consultation' => now()->subDays(8)->setTime(10, 30),
                'diagnostic' => 'Suivi post-operatoire stable',
                'notes' => 'Tension normale, cicatrisation satisfaisante.',
                'traitement' => 'Repos relatif et controle dans 15 jours.',
            ],
            [
                'patient' => 1,
                'medecin' => 0,
                'date_consultation' => now()->subDays(5)->setTime(15, 0),
                'diagnostic' => 'Hypertension legere',
                'notes' => 'Surveillance de la tension recommandee.',
                'traitement' => 'Adaptation du traitement et regime pauvre en sel.',
            ],
            [
                'patient' => 2,
                'medecin' => 1,
                'date_consultation' => now()->subDays(3)->setTime(11, 15),
                'diagnostic' => 'Douleur thoracique non specifique',
                'notes' => 'Radio demandee pour controle.',
                'traitement' => 'Antalgique leger et controle radiologique.',
            ],
            [
                'patient' => 3,
                'medecin' => 2,
                'date_consultation' => now()->subDay()->setTime(9, 45),
                'diagnostic' => 'Fatigue generale',
                'notes' => 'Bilan sanguin prescrit.',
                'traitement' => 'Vitamines et analyse sanguine complete.',
            ],
        ])->map(function (array $item) use ($patients, $medecins) {
            return Consultation::updateOrCreate(
                [
                    'id_patient' => $patients[$item['patient']]->id_patient,
                    'id_medecin' => $medecins[$item['medecin']]->id_medecin,
                    'date_consultation' => $item['date_consultation'],
                ],
                [
                    'diagnostic' => $item['diagnostic'],
                    'notes' => $item['notes'],
                    'traitement' => $item['traitement'],
                ],
            );
        });

        $types = TypeDocument::all()->keyBy('nom_type');

        Storage::makeDirectory('documents');

        $documents = [
            ['patient' => 0, 'medecin' => 0, 'consultation' => 0, 'type' => 'Analyse', 'titre' => 'Analyse sanguine complete', 'statut' => 'actif'],
            ['patient' => 1, 'medecin' => 0, 'consultation' => 1, 'type' => 'Ordonnance', 'titre' => 'Ordonnance cardiologie', 'statut' => 'actif'],
            ['patient' => 2, 'medecin' => 1, 'consultation' => 2, 'type' => 'Radio', 'titre' => 'Radio thorax', 'statut' => 'archive'],
            ['patient' => 3, 'medecin' => 2, 'consultation' => 3, 'type' => 'Rapport medical', 'titre' => 'Rapport de consultation generale', 'statut' => 'actif'],
        ];

        foreach ($documents as $index => $document) {
            $fileName = 'document-demo-'.($index + 1).'.pdf';
            $path = 'documents/'.$fileName;

            if (! Storage::exists($path)) {
                Storage::put($path, "Document demo MedArchive\nTitre: {$document['titre']}\n");
            }

            Document::updateOrCreate(
                ['nom_fichier' => $fileName],
                [
                    'id_patient' => $patients[$document['patient']]->id_patient,
                    'id_medecin' => $medecins[$document['medecin']]->id_medecin,
                    'id_consultation' => $consultations[$document['consultation']]->id_consultation,
                    'id_type' => $types[$document['type']]->id_type,
                    'titre' => $document['titre'],
                    'description' => 'Document de demonstration pour les tests frontend.',
                    'chemin_fichier' => $path,
                    'taille_fichier' => Storage::size($path),
                    'statut' => $document['statut'],
                ],
            );
        }

        foreach ($patients as $patient) {
            Notification::updateOrCreate(
                [
                    'id_user' => $patient->id_user,
                    'message' => 'Un nouveau document medical est disponible dans votre espace.',
                ],
                ['lu' => false],
            );
        }

        foreach ([
            ['action' => 'Creation demo', 'description' => 'Jeu de donnees de test ajoute.'],
            ['action' => 'Upload document', 'description' => 'Documents medicaux demo importes.'],
            ['action' => 'Consultation', 'description' => 'Consultations demo creees.'],
        ] as $activity) {
            Activite::updateOrCreate(
                ['id_user' => $admin->id_user, 'action' => $activity['action']],
                ['description' => $activity['description']],
            );
        }
    }
}
