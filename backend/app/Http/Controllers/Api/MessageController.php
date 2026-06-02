<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = Message::with(['expediteur', 'destinataire', 'facture.consultation.patient.user'])->latest('date_envoi');
        $user = $request->user();

        if (! in_array($user->role, ['admin', 'facturation'], true)) {
            $query->where('id_destinataire', $user->id_user);
        }

        return $query->paginate(10);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_destinataire' => ['required', 'exists:users,id_user'],
            'id_facture' => ['nullable', 'exists:facture,id_facture'],
            'sujet' => ['required', 'string', 'max:180'],
            'contenu' => ['required', 'string'],
        ]);

        $data['id_expediteur'] = $request->user()->id_user;

        return response()->json(Message::create($data)->load(['destinataire', 'facture']), 201);
    }

    public function markAsRead(Message $message)
    {
        $user = request()->user();
        abort_unless(in_array($user->role, ['admin', 'facturation'], true) || $message->id_destinataire === $user->id_user, 403);

        $message->update(['lu' => true]);

        return $message;
    }
}
