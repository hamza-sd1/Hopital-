<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $patient = $this->route('patient');

        return [
            'ip_patient' => ['sometimes', 'string', 'max:30', Rule::unique('patient', 'ip_patient')->ignore($patient?->id_patient, 'id_patient')],
            'cin' => ['sometimes', 'string', 'max:50', Rule::unique('patient', 'cin')->ignore($patient?->id_patient, 'id_patient')],
            'telephone' => ['nullable', 'string', 'max:30'],
            'date_naissance' => ['nullable', 'date'],
            'sexe' => ['nullable', Rule::in(['homme', 'femme'])],
            'adresse' => ['nullable', 'string', 'max:255'],
            'groupe_sanguin' => ['nullable', 'string', 'max:10'],
            'contact_urgence' => ['nullable', 'string', 'max:100'],
        ];
    }
}
