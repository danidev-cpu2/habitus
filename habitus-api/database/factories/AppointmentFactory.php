<?php

namespace Database\Factories;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        return [
            'status' => fake()->randomElement(['pending', 'held', 'canceled']),
            'date' => fake()->dateTimeBetween('-30 days', '+30 days')->format('Y-m-d'),
            'hour' => fake()->randomElement(['08:30:00', '09:30:00', '10:30:00', '11:30:00', '12:30:00', '14:30:00', '15:30:00', '16:30:00']),
        ];
    }
}
