<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeDocument extends Model
{
    protected $table = 'type_document';

    protected $primaryKey = 'id_type';

    public $timestamps = false;

    protected $fillable = ['nom_type', 'description'];

    public function documents()
    {
        return $this->hasMany(Document::class, 'id_type', 'id_type');
    }
}
