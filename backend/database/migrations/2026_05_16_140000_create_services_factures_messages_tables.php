<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','medecin','patient','facturation') DEFAULT 'patient'");
        }

        Schema::create('service', function (Blueprint $table) {
            $table->id('id_service');
            $table->string('nom_service')->unique();
            $table->text('description')->nullable();
            $table->string('telephone')->nullable();
            $table->string('emplacement')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
        });

        Schema::table('medecin', function (Blueprint $table) {
            $table->foreignId('id_service')->nullable()->after('id_user')->constrained('service', 'id_service')->nullOnDelete();
        });

        Schema::table('consultation', function (Blueprint $table) {
            $table->foreignId('id_service')->nullable()->after('id_medecin')->constrained('service', 'id_service')->nullOnDelete();
        });

        Schema::create('facture', function (Blueprint $table) {
            $table->id('id_facture');
            $table->foreignId('id_patient')->constrained('patient', 'id_patient')->cascadeOnDelete();
            $table->foreignId('id_consultation')->nullable()->constrained('consultation', 'id_consultation')->nullOnDelete();
            $table->foreignId('id_service')->nullable()->constrained('service', 'id_service')->nullOnDelete();
            $table->string('reference')->unique();
            $table->decimal('montant', 10, 2);
            $table->enum('statut_paiement', ['non_payee', 'payee', 'partiellement_payee', 'annulee'])->default('non_payee');
            $table->date('date_facture');
            $table->date('date_paiement')->nullable();
            $table->text('notes')->nullable();
        });

        Schema::create('message', function (Blueprint $table) {
            $table->id('id_message');
            $table->foreignId('id_expediteur')->nullable()->constrained('users', 'id_user')->nullOnDelete();
            $table->foreignId('id_destinataire')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->foreignId('id_facture')->nullable()->constrained('facture', 'id_facture')->nullOnDelete();
            $table->string('sujet');
            $table->text('contenu');
            $table->boolean('lu')->default(false);
            $table->timestamp('date_envoi')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message');
        Schema::dropIfExists('facture');

        Schema::table('consultation', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_service');
        });

        Schema::table('medecin', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_service');
        });

        Schema::dropIfExists('service');

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','medecin','patient') DEFAULT 'patient'");
        }
    }
};
