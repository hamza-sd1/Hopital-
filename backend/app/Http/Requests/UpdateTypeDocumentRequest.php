<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTypeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $typeDocument = $this->route('typeDocument');

        return [
            'nom_type' => ['sometimes', 'string', 'max:100', Rule::unique('type_document', 'nom_type')->ignore($typeDocument?->id_type, 'id_type')],
            'description' => ['nullable', 'string'],
        ];
    }
}
