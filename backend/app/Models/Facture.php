<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $table = 'facture';

    protected $primaryKey = 'id_facture';

    public $timestamps = false;

    protected $fillable = [
        'id_patient',
        'id_consultation',
        'id_service',
        'reference',
        'montant',
        'statut_paiement',
        'date_facture',
        'date_paiement',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'montant' => 'decimal:2',
            'date_facture' => 'date',
            'date_paiement' => 'date',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'id_patient', 'id_patient');
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'id_service', 'id_service');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'id_facture', 'id_facture');
    }
}
