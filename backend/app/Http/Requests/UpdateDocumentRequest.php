<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role !== 'patient';
    }

    public function rules(): array
    {
        return [
            'id_type' => ['sometimes', 'exists:type_document,id_type'],
            'titre' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'statut' => ['sometimes', Rule::in(['actif', 'archive'])],
        ];
    }
}
