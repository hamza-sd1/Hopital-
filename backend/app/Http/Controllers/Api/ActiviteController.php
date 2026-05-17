<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActiviteRequest;
use App\Models\Activite;
use Illuminate\Http\Request;

class ActiviteController extends Controller
{
    public function index(Request $request)
    {
        $query = Activite::with('user')->latest('date_action');

        if ($request->filled('id_user')) {
            $query->where('id_user', $request->query('id_user'));
        }

        return $query->paginate(20);
    }

    public function store(StoreActiviteRequest $request)
    {
        $data = $request->validated();

        return response()->json(Activite::create($data), 201);
    }
}
