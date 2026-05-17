<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['patient.user', 'medecin.user', 'consultation', 'type']);
        $this->applyUserScope($request, $query);

        foreach (['id_patient', 'id_medecin', 'id_consultation', 'id_type', 'statut'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->query($field));
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                    ->orWhere('nom_fichier', 'like', "%{$search}%");
            });
        }

        return $query->latest('date_upload')->paginate(10);
    }

    public function store(StoreDocumentRequest $request)
    {
        $data = $request->validated();

        $file = $request->file('fichier');
        $path = $file->store('documents');

        unset($data['fichier']);
        if ($request->user()->role === 'medecin') {
            $data['id_medecin'] = $request->user()->medecin?->id_medecin;
            abort_unless($data['id_medecin'], 403, 'Profil medecin introuvable.');
        }

        $data['nom_fichier'] = $file->getClientOriginalName();
        $data['chemin_fichier'] = $path;
        $data['taille_fichier'] = $file->getSize();
        $data['statut'] ??= 'actif';

        return response()->json(Document::create($data)->load(['patient.user', 'medecin.user', 'type']), 201);
    }

    public function show(Document $document)
    {
        $this->authorizeDocument($document);

        return $document->load(['patient.user', 'medecin.user', 'consultation', 'type']);
    }

    public function update(UpdateDocumentRequest $request, Document $document)
    {
        $this->authorizeDocumentManagement($request, $document);

        $data = $request->validated();

        $document->update($data);

        return $document->load(['patient.user', 'medecin.user', 'type']);
    }

    public function download(Document $document)
    {
        $this->authorizeDocument($document);

        abort_unless(Storage::exists($document->chemin_fichier), 404, 'Fichier introuvable.');

        return Storage::download($document->chemin_fichier, $document->nom_fichier);
    }

    public function preview(Document $document)
    {
        $this->authorizeDocument($document);

        abort_unless(Storage::exists($document->chemin_fichier), 404, 'Fichier introuvable.');

        $path = Storage::path($document->chemin_fichier);
        $mimeType = Storage::mimeType($document->chemin_fichier) ?: 'application/octet-stream';

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.$document->nom_fichier.'"',
        ]);
    }

    public function destroy(Document $document)
    {
        $this->authorizeDocumentManagement(request(), $document);

        Storage::delete($document->chemin_fichier);
        $document->delete();

        return response()->json(['message' => 'Document supprime.']);
    }

    private function applyUserScope(Request $request, $query): void
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $query->where('id_patient', $user->patient?->id_patient ?? 0);
        }

        if ($user->role === 'medecin') {
            $query->where('id_medecin', $user->medecin?->id_medecin ?? 0);
        }
    }

    private function authorizeDocument(Document $document): void
    {
        $user = request()->user();

        if ($user->role === 'admin') {
            return;
        }

        if ($user->role === 'patient' && $document->id_patient === $user->patient?->id_patient) {
            return;
        }

        if ($user->role === 'medecin' && $document->id_medecin === $user->medecin?->id_medecin) {
            return;
        }

        abort(403, 'Acces non autorise.');
    }

    private function authorizeDocumentManagement(Request $request, Document $document): void
    {
        abort_if($request->user()->role === 'patient', 403, 'Acces non autorise.');
        $this->authorizeDocument($document);
    }
}
