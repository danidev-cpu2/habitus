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
            'telephone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'rol' => 'required|in:admin,psychologist,receptionist,patient',
            'status' => [
                Rule::requiredIf(fn() => $this->rol === 'patient'),
                'in:active,inactive',
            ],
            // Campos opcionales del perfil del paciente
            'birth_date' => 'nullable|date',
            'profession' => 'nullable|string|max:100',
            'marital_status' => 'nullable|in:single,married,divorced,widowed',
            'emergency_phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'consultation_reason' => 'nullable|string',
            'psychologist_id' => [
                Rule::requiredIf(fn() => $this->rol === 'patient'),
                'nullable',
                'exists:users,id',
            ],
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
            'telephone.required' => 'El teléfono es obligatorio.',
            'telephone.max'      => 'El telefono no puede superar los 20 caracteres.',
            'password.required'  => 'La contrasena es obligatoria.',
            'password.min'       => 'La contrasena debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmacion de contrasena no coincide.',
            'rol.required'       => 'El rol es obligatorio.',
            'rol.in'             => 'El rol debe ser: admin, psychologist, receptionist o patient.',
            'status.required'    => 'El estado es obligatorio para pacientes.',
            'status.in'          => 'El estado debe ser: active o inactive.',
            'psychologist_id.required' => 'El psicólogo es obligatorio para pacientes.',
            'psychologist_id.exists'   => 'El psicólogo seleccionado no existe.',
        ];
    }

}
