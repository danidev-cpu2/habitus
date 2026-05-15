<?php

namespace Database\Factories;

use App\Models\PatientProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PatientProfile>
 */
class PatientProfileFactory extends Factory
{
    protected $model = PatientProfile::class;

    public function definition(): array
    {
        return [
            'birth_date' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'profession' => fake()->jobTitle(),
            'marital_status' => fake()->randomElement(['single', 'married', 'divorced', 'widowed']),
            'emergency_phone' => '+34' . fake()->numerify('6#######'),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'consultation_reason' => fake()->sentence(10),
            'psychologist_id' => null,
        ];
    }
}
