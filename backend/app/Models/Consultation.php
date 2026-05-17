<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $table = 'consultation';

    protected $primaryKey = 'id_consultation';

    public $timestamps = false;

    protected $fillable = [
        'id_patient',
        'id_medecin',
        'id_service',
        'date_consultation',
        'diagnostic',
        'notes',
        'traitement',
    ];

    protected function casts(): array
    {
        return ['date_consultation' => 'datetime'];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'id_patient', 'id_patient');
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class, 'id_medecin', 'id_medecin');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'id_consultation', 'id_consultation');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'id_service', 'id_service');
    }

    public function facture()
    {
        return $this->hasOne(Facture::class, 'id_consultation', 'id_consultation');
    }
}
