<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedecinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_service' => ['nullable', 'exists:service,id_service'],
            'specialite' => ['sometimes', 'string', 'max:150'],
            'numero_bureau' => ['nullable', 'string', 'max:50'],
            'telephone_professionnel' => ['nullable', 'string', 'max:30'],
        ];
    }
}
