<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DailyLogRequest extends FormRequest
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
                    'date' => [
                        'required',
                        'date',
                    ],
                    'hour' => [
                        'required',
                        'date_format:H:i',
                    ],
                    'status' => [
                        'required',
                        'in:entry,exit',
                    ],
                ];

            case 'PUT':
            case 'PATCH':
                return [
                    'date' => [
                        'sometimes',
                        'date',
                    ],
                    'hour' => [
                        'sometimes',
                        'date_format:H:i',
                    ],
                    'status' => [
                        'sometimes',
                        'in:entry,exit',
                    ],
                ];

            default:
                return [];
        }
    }

    public function messages(): array
    {
        return [
            'date.required'      => 'La fecha es obligatoria.',
            'date.date'          => 'La fecha no tiene un formato valido.',
            'hour.required'      => 'La hora es obligatoria.',
            'hour.date_format'   => 'La hora debe tener el formato HH:MM.',
            'status.required'    => 'El estado es obligatorio.',
            'status.in'          => 'El estado debe ser entry o exit.',
        ];
    }
}
