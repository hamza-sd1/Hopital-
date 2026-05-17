<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $table = 'service';

    protected $primaryKey = 'id_service';

    public $timestamps = false;

    protected $fillable = ['nom_service', 'description', 'telephone', 'emplacement', 'statut'];

    public function medecins()
    {
        return $this->hasMany(Medecin::class, 'id_service', 'id_service');
    }

    public function factures()
    {
        return $this->hasMany(Facture::class, 'id_service', 'id_service');
    }
}
