<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role !== 'patient';
    }

    public function rules(): array
    {
        return [
            'id_patient' => ['required', 'exists:patient,id_patient'],
            'id_medecin' => ['nullable', 'exists:medecin,id_medecin'],
            'id_consultation' => ['nullable', 'exists:consultation,id_consultation'],
            'id_type' => ['required', 'exists:type_document,id_type'],
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'fichier' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'statut' => ['nullable', Rule::in(['actif', 'archive'])],
        ];
    }
}
