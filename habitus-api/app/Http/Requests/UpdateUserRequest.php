<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user')->id;

        return [
            'name'      => 'sometimes|required|string|max:100',
            'surname'   => 'sometimes|required|string|max:100',
            'email'     => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'dni'       => [
                'sometimes',
                'required',
                'string',
                Rule::unique('users', 'dni')->ignore($userId),
            ],
            'telephone' => 'nullable|string|max:20',
            'password'  => 'sometimes|required|string|min:8|confirmed',
            'rol'       => 'sometimes|required|in:admin,psychologist,receptionist,patient',
            'status'    => [
                Rule::requiredIf(fn () => ($this->rol ?? $this->route('user')->rol) === 'patient'),
                'in:active,inactive',
            ],
        ];
    }
    // Mensajes para validación del request
    public function messages(): array
    {
        return [
            'name.required'      => 'El nombre es obligatorio.',
            'name.max'           => 'El nombre no puede superar los 100 caracteres.',
            'surname.required'   => 'El apellido es obligatorio.',
            'surname.max'        => 'El apellido no puede superar los 100 caracteres.',
            'email.required'     => 'El email es obligatorio.',
            'email.email'        => 'El email debe ser una direccion valida.',
            'email.unique'       => 'Este email ya esta registrado.',
            'dni.required'       => 'El DNI es obligatorio.',
            'dni.unique'         => 'Este DNI ya esta registrado.',
            'telephone.max'      => 'El telefono no puede superar los 20 caracteres.',
            'password.required'  => 'La contrasena es obligatoria.',
            'password.min'       => 'La contrasena debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmacion de contrasena no coincide.',
            'rol.required'       => 'El rol es obligatorio.',
            'rol.in'             => 'El rol debe ser: admin, psychologist, receptionist o patient.',
            'status.required'    => 'El estado es obligatorio para pacientes.',
            'status.in'          => 'El estado debe ser: active o inactive.',
        ];
    }
}
