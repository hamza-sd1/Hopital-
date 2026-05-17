<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient', function (Blueprint $table) {
            $table->id('id_patient');
            $table->foreignId('id_user')->unique()->constrained('users', 'id_user')->cascadeOnDelete();
            $table->string('cin')->unique();
            $table->string('telephone')->nullable();
            $table->date('date_naissance')->nullable();
            $table->enum('sexe', ['homme', 'femme'])->nullable();
            $table->string('adresse')->nullable();
            $table->string('groupe_sanguin')->nullable();
            $table->string('contact_urgence')->nullable();
        });

        Schema::create('medecin', function (Blueprint $table) {
            $table->id('id_medecin');
            $table->foreignId('id_user')->unique()->constrained('users', 'id_user')->cascadeOnDelete();
            $table->string('specialite');
            $table->string('numero_bureau')->nullable();
            $table->string('telephone_professionnel')->nullable();
        });

        Schema::create('type_document', function (Blueprint $table) {
            $table->id('id_type');
            $table->string('nom_type')->unique();
            $table->text('description')->nullable();
        });

        Schema::create('consultation', function (Blueprint $table) {
            $table->id('id_consultation');
            $table->foreignId('id_patient')->constrained('patient', 'id_patient')->cascadeOnDelete();
            $table->foreignId('id_medecin')->constrained('medecin', 'id_medecin')->cascadeOnDelete();
            $table->dateTime('date_consultation');
            $table->text('diagnostic')->nullable();
            $table->text('notes')->nullable();
            $table->text('traitement')->nullable();
        });

        Schema::create('document', function (Blueprint $table) {
            $table->id('id_document');
            $table->foreignId('id_patient')->constrained('patient', 'id_patient')->cascadeOnDelete();
            $table->foreignId('id_medecin')->nullable()->constrained('medecin', 'id_medecin')->nullOnDelete();
            $table->foreignId('id_consultation')->nullable()->constrained('consultation', 'id_consultation')->nullOnDelete();
            $table->foreignId('id_type')->constrained('type_document', 'id_type')->restrictOnDelete();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('nom_fichier');
            $table->string('chemin_fichier');
            $table->unsignedBigInteger('taille_fichier');
            $table->timestamp('date_upload')->useCurrent();
            $table->enum('statut', ['actif', 'archive'])->default('actif');
        });

        Schema::create('notification', function (Blueprint $table) {
            $table->id('id_notification');
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('lu')->default(false);
            $table->timestamp('date_creation')->useCurrent();
        });

        Schema::create('activite', function (Blueprint $table) {
            $table->id('id_activite');
            $table->foreignId('id_user')->nullable()->constrained('users', 'id_user')->nullOnDelete();
            $table->string('action');
            $table->text('description')->nullable();
            $table->timestamp('date_action')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activite');
        Schema::dropIfExists('notification');
        Schema::dropIfExists('document');
        Schema::dropIfExists('consultation');
        Schema::dropIfExists('type_document');
        Schema::dropIfExists('medecin');
        Schema::dropIfExists('patient');
    }
};
