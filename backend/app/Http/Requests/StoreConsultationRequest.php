<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role !== 'patient';
    }

    public function rules(): array
    {
        return [
            'id_patient' => ['required', 'exists:patient,id_patient'],
            'id_medecin' => ['required', 'exists:medecin,id_medecin'],
            'id_service' => ['nullable', 'exists:service,id_service'],
            'date_consultation' => ['required', 'date'],
            'diagnostic' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'traitement' => ['nullable', 'string'],
        ];
    }
}
