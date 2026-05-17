<?php

namespace Database\Seeders;

use App\Models\TypeDocument;
use Illuminate\Database\Seeder;

class TypeDocumentSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['nom_type' => 'Analyse', 'description' => 'Resultats des analyses medicales.'],
            ['nom_type' => 'Radio', 'description' => 'Images et comptes rendus radiologiques.'],
            ['nom_type' => 'Prescription', 'description' => 'Prescriptions medicales.'],
            ['nom_type' => 'Certificat', 'description' => 'Certificats medicaux.'],
            ['nom_type' => 'Rapport medical', 'description' => 'Rapports medicaux.'],
            ['nom_type' => 'Ordonnance', 'description' => 'Ordonnances.'],
        ] as $type) {
            TypeDocument::firstOrCreate(['nom_type' => $type['nom_type']], $type);
        }
    }
}
