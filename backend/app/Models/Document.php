<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $table = 'document';

    protected $primaryKey = 'id_document';

    public $timestamps = false;

    protected $fillable = [
        'id_patient',
        'id_medecin',
        'id_consultation',
        'id_type',
        'titre',
        'description',
        'nom_fichier',
        'chemin_fichier',
        'taille_fichier',
        'date_upload',
        'statut',
    ];

    protected function casts(): array
    {
        return ['date_upload' => 'datetime'];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'id_patient', 'id_patient');
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class, 'id_medecin', 'id_medecin');
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }

    public function type()
    {
        return $this->belongsTo(TypeDocument::class, 'id_type', 'id_type');
    }
}
