<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTypeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom_type' => ['required', 'string', 'max:100', 'unique:type_document,nom_type'],
            'description' => ['nullable', 'string'],
        ];
    }
}
