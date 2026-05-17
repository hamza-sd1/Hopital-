<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient', function (Blueprint $table) {
            $table->string('ip_patient')->nullable()->after('id_user');
        });

        DB::table('patient')
            ->orderBy('id_patient')
            ->get(['id_patient'])
            ->each(function ($patient, int $index): void {
                DB::table('patient')
                    ->where('id_patient', $patient->id_patient)
                    ->update(['ip_patient' => (string) (20260001 + $index)]);
            });

        Schema::table('patient', function (Blueprint $table) {
            $table->unique('ip_patient');
        });
    }

    public function down(): void
    {
        Schema::table('patient', function (Blueprint $table) {
            $table->dropUnique(['ip_patient']);
            $table->dropColumn('ip_patient');
        });
    }
};
