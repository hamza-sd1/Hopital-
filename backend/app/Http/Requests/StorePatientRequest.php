<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_user' => ['required', 'exists:users,id_user', 'unique:patient,id_user'],
            'ip_patient' => ['required', 'string', 'max:30', 'unique:patient,ip_patient'],
            'cin' => ['required', 'string', 'max:50', 'unique:patient,cin'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'date_naissance' => ['nullable', 'date'],
            'sexe' => ['nullable', Rule::in(['homme', 'femme'])],
            'adresse' => ['nullable', 'string', 'max:255'],
            'groupe_sanguin' => ['nullable', 'string', 'max:10'],
            'contact_urgence' => ['nullable', 'string', 'max:100'],
        ];
    }
}
