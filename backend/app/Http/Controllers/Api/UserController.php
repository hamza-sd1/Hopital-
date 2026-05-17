<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->with(['patient', 'medecin'])->latest('id_user');

        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom_complet', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->paginate(10);
    }

    public function store(StoreUserRequest $request)
    {
        return response()->json(User::create($request->validated()), 201);
    }

    public function show(User $user)
    {
        return $user->load(['patient', 'medecin']);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return $user->load(['patient', 'medecin']);
    }

    public function destroy(User $user)
    {
        abort_if($user->id_user === request()->user()->id_user, 422, 'Vous ne pouvez pas supprimer votre propre compte.');

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprime.']);
    }
}
