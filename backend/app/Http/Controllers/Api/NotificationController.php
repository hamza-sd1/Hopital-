<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNotificationRequest;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::with('user')->latest('date_creation');
        $user = $request->user();

        if ($user->role !== 'admin') {
            $query->where('id_user', $user->id_user);
        } elseif ($request->filled('id_user')) {
            $query->where('id_user', $request->query('id_user'));
        }

        return $query->paginate(10);
    }

    public function store(StoreNotificationRequest $request)
    {
        $data = $request->validated();

        return response()->json(Notification::create($data), 201);
    }

    public function show(Notification $notification)
    {
        $this->authorizeNotification($notification);

        return $notification->load('user');
    }

    public function markAsRead(Notification $notification)
    {
        $this->authorizeNotification($notification);

        $notification->update(['lu' => true]);

        return $notification;
    }

    public function destroy(Notification $notification)
    {
        $this->authorizeNotification($notification);

        $notification->delete();

        return response()->json(['message' => 'Notification supprimee.']);
    }

    private function authorizeNotification(Notification $notification): void
    {
        $user = request()->user();

        if ($user->role === 'admin' || $notification->id_user === $user->id_user) {
            return;
        }

        abort(403, 'Acces non autorise.');
    }
}
