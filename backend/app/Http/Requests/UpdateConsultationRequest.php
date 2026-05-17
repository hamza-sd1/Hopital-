<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role !== 'patient';
    }

    public function rules(): array
    {
        return [
            'id_service' => ['nullable', 'exists:service,id_service'],
            'date_consultation' => ['sometimes', 'date'],
            'diagnostic' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'traitement' => ['nullable', 'string'],
        ];
    }
}
