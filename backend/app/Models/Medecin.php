<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medecin extends Model
{
    protected $table = 'medecin';

    protected $primaryKey = 'id_medecin';

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'id_service',
        'specialite',
        'numero_bureau',
        'telephone_professionnel',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'id_medecin', 'id_medecin');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'id_medecin', 'id_medecin');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'id_service', 'id_service');
    }
}
