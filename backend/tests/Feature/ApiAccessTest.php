<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\Document;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\TypeDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_view_only_his_own_documents(): void
    {
        [$patientUser, $patient] = $this->createPatient('patient1@test.local', 'PA001');
        [$otherUser, $otherPatient] = $this->createPatient('patient2@test.local', 'PA002');
        $type = TypeDocument::create(['nom_type' => 'Analyse']);

        $ownDocument = Document::create([
            'id_patient' => $patient->id_patient,
            'id_type' => $type->id_type,
            'titre' => 'Analyse patient 1',
            'nom_fichier' => 'analyse-1.pdf',
            'chemin_fichier' => 'documents/analyse-1.pdf',
            'taille_fichier' => 1000,
        ]);

        $otherDocument = Document::create([
            'id_patient' => $otherPatient->id_patient,
            'id_type' => $type->id_type,
            'titre' => 'Analyse patient 2',
            'nom_fichier' => 'analyse-2.pdf',
            'chemin_fichier' => 'documents/analyse-2.pdf',
            'taille_fichier' => 1000,
        ]);

        Sanctum::actingAs($patientUser);

        $this->getJson("/api/documents/{$ownDocument->id_document}")
            ->assertOk()
            ->assertJsonPath('id_document', $ownDocument->id_document);

        $this->getJson("/api/documents/{$otherDocument->id_document}")
            ->assertForbidden();

        $otherUser->delete();
    }

    public function test_patient_cannot_upload_document(): void
    {
        [$patientUser, $patient] = $this->createPatient('patient@test.local', 'PA003');
        $type = TypeDocument::create(['nom_type' => 'Radio']);

        Sanctum::actingAs($patientUser);

        $this->postJson('/api/documents', [
            'id_patient' => $patient->id_patient,
            'id_type' => $type->id_type,
            'titre' => 'Radio interdite',
        ])->assertForbidden();
    }

    public function test_medecin_sees_only_his_consultations(): void
    {
        [$patientUser, $patient] = $this->createPatient('patient4@test.local', 'PA004');
        [$medecinUser, $medecin] = $this->createMedecin('doctor1@test.local');
        [$otherMedecinUser, $otherMedecin] = $this->createMedecin('doctor2@test.local');

        Consultation::create([
            'id_patient' => $patient->id_patient,
            'id_medecin' => $medecin->id_medecin,
            'date_consultation' => now(),
            'diagnostic' => 'Diagnostic visible',
        ]);

        Consultation::create([
            'id_patient' => $patient->id_patient,
            'id_medecin' => $otherMedecin->id_medecin,
            'date_consultation' => now(),
            'diagnostic' => 'Diagnostic cache',
        ]);

        Sanctum::actingAs($medecinUser);

        $this->getJson('/api/consultations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id_medecin', $medecin->id_medecin);

        $patientUser->delete();
        $otherMedecinUser->delete();
    }

    private function createPatient(string $email, string $cin): array
    {
        $user = User::create([
            'nom_complet' => 'Patient Test',
            'email' => $email,
            'password' => 'password',
            'role' => 'patient',
            'statut' => 'actif',
        ]);

        $patient = Patient::create([
            'id_user' => $user->id_user,
            'cin' => $cin,
        ]);

        return [$user, $patient];
    }

    private function createMedecin(string $email): array
    {
        $user = User::create([
            'nom_complet' => 'Medecin Test',
            'email' => $email,
            'password' => 'password',
            'role' => 'medecin',
            'statut' => 'actif',
        ]);

        $medecin = Medecin::create([
            'id_user' => $user->id_user,
            'specialite' => 'Cardiologie',
        ]);

        return [$user, $medecin];
    }
}
