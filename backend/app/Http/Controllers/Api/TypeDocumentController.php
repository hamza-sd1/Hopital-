<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTypeDocumentRequest;
use App\Http\Requests\UpdateTypeDocumentRequest;
use App\Models\TypeDocument;

class TypeDocumentController extends Controller
{
    public function index()
    {
        return TypeDocument::orderBy('nom_type')->get();
    }

    public function store(StoreTypeDocumentRequest $request)
    {
        $data = $request->validated();

        return response()->json(TypeDocument::create($data), 201);
    }

    public function show(TypeDocument $typeDocument)
    {
        return $typeDocument;
    }

    public function update(UpdateTypeDocumentRequest $request, TypeDocument $typeDocument)
    {
        $data = $request->validated();

        $typeDocument->update($data);

        return $typeDocument;
    }

    public function destroy(TypeDocument $typeDocument)
    {
        $typeDocument->delete();

        return response()->json(['message' => 'Type de document supprime.']);
    }
}
