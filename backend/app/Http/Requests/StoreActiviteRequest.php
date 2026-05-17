<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActiviteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_user' => ['nullable', 'exists:users,id_user'],
            'action' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }
}
