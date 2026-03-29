<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;


 // SE CREA ESTE REQUEST PARA FACILITAR LA VALIDACIÓN DE UPDATESTATUS
class UpdateAppointmentRequest extends FormRequest
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
            'status' => 'required|in:pending,canceled,held',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'El estado es obligatorio.',
            'status.in'       => 'El estado debe ser: pending, canceled o held.',
        ];
    }
}
