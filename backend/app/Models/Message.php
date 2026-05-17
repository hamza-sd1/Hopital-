<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'message';

    protected $primaryKey = 'id_message';

    public $timestamps = false;

    protected $fillable = ['id_expediteur', 'id_destinataire', 'id_facture', 'sujet', 'contenu', 'lu', 'date_envoi'];

    protected function casts(): array
    {
        return [
            'lu' => 'boolean',
            'date_envoi' => 'datetime',
        ];
    }

    public function expediteur()
    {
        return $this->belongsTo(User::class, 'id_expediteur', 'id_user');
    }

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'id_destinataire', 'id_user');
    }

    public function facture()
    {
        return $this->belongsTo(Facture::class, 'id_facture', 'id_facture');
    }
}
