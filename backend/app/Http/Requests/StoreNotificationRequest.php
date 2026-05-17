<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'id_user' => ['required', 'exists:users,id_user'],
            'message' => ['required', 'string'],
            'lu' => ['nullable', 'boolean'],
        ];
    }
}
