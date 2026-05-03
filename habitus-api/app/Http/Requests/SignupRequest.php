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
                Rule::requiredIf(fn() => $this->rol === 'patient'),
                'in:active,inactive',
            ],
            'theme' => 'sometimes|required|in:light,dark',
            'notifications' => 'sometimes|boolean',
        ];
    }

    /**
     * Mensajes de error customizados
     */
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
            'theme.required'     => 'El tema es obligatorio cuando se envía.',
            'theme.in'           => 'El tema debe ser light o dark.',
            'notifications.boolean' => 'Las notificaciones debe ser verdadero o falso.',
        ];
    }

}
