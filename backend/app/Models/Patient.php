<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $table = 'patient';

    protected $primaryKey = 'id_patient';

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'ip_patient',
        'cin',
        'telephone',
        'date_naissance',
        'sexe',
        'adresse',
        'groupe_sanguin',
        'contact_urgence',
    ];

    protected function casts(): array
    {
        return ['date_naissance' => 'date'];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'id_patient', 'id_patient');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'id_patient', 'id_patient');
    }

    public function factures()
    {
        return $this->hasMany(Facture::class, 'id_patient', 'id_patient');
    }
}
