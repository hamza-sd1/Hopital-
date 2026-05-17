<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedecinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_user' => ['required', 'exists:users,id_user', 'unique:medecin,id_user'],
            'id_service' => ['nullable', 'exists:service,id_service'],
            'specialite' => ['required', 'string', 'max:150'],
            'numero_bureau' => ['nullable', 'string', 'max:50'],
            'telephone_professionnel' => ['nullable', 'string', 'max:30'],
        ];
    }
}
