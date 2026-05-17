<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activite extends Model
{
    protected $table = 'activite';

    protected $primaryKey = 'id_activite';

    public $timestamps = false;

    protected $fillable = ['id_user', 'action', 'description', 'date_action'];

    protected function casts(): array
    {
        return ['date_action' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
