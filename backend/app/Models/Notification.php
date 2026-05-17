<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notification';

    protected $primaryKey = 'id_notification';

    public $timestamps = false;

    protected $fillable = ['id_user', 'message', 'lu', 'date_creation'];

    protected function casts(): array
    {
        return [
            'lu' => 'boolean',
            'date_creation' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
