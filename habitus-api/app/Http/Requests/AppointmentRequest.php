<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AppointmentRequest extends FormRequest
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
        $method = $this->method();

        switch ($method) {
            case 'POST':
                return [
                    'patient_id' => [
                        'required',
                        'integer',
                        'exists:users,id',
                    ],
                    'psychologist_id' => [
                        'required',
                        'integer',
                        'exists:users,id',
                    ],
                    'status' => [
                        'sometimes',
                        'in:pending,canceled,held',
                    ],
                    'date' => [
                        'required',
                        'date',
                        'after_or_equal:today',
                    ],
                    'hour' => [
                        'required',
                        'date_format:H:i',
                    ],
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'patient_id' => [
                        'sometimes',
                        'integer',
                        'exists:users,id',
                    ],
                    'psychologist_id' => [
                        'sometimes',
                        'integer',
                        'exists:users,id',
                    ],
                    'status' => [
                        'sometimes',
                        'in:pending,canceled,held',
                    ],
                    'date' => [
                        'sometimes',
                        'date',
                    ],
                    'hour' => [
                        'sometimes',
                        'date_format:H:i',
                    ],
                ];

            default:
                return [];
        }
    }

    public function messages(): array
    {
        return [
            'patient_id.required'      => 'El paciente es obligatorio.',
            'patient_id.integer'       => 'El paciente debe ser un ID valido.',
            'patient_id.exists'        => 'El paciente seleccionado no existe.',
            'psychologist_id.required' => 'El psicologo es obligatorio.',
            'psychologist_id.integer'  => 'El psicologo debe ser un ID valido.',
            'psychologist_id.exists'   => 'El psicologo seleccionado no existe.',
            'status.required'          => 'El estado es obligatorio.',
            'status.in'                => 'El estado debe ser: pending, canceled o held.',
            'date.required'            => 'La fecha es obligatoria.',
            'date.date'                => 'La fecha debe ser una fecha valida.',
            'date.after_or_equal'      => 'La fecha debe ser hoy o posterior.',
            'hour.required'            => 'La hora es obligatoria.',
            'hour.date_format'         => 'La hora debe tener el formato HH:MM.',
        ];
    }
}
