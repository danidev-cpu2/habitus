<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SignupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'surname' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'dni' => 'required|string|unique:users,dni',
            'telephone' => 'string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'rol' => 'required|in:admin,psychologist,receptionist,patient',
            'status' => [
                Rule::requiredIf(fn () => $this->rol === 'patient'),
                'in:active,inactive',
            ]
        ];
    }
}
