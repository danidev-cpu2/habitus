<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->createAdministrativeUsers();

        $psychologists = $this->createPsychologists();
        $this->createPatientsAndAppointments($psychologists);
        $this->createInactivePatient($psychologists->random());
    }

    private function createAdministrativeUsers(): void
    {
        User::factory()->create([
            'name' => 'Administrador',
            'surname' => 'Central',
            'email' => 'admin@habitus.test',
            'dni' => '00000000',
            'telephone' => '+34100000000',
            'rol' => 'admin',
            'status' => 'active',
            'password' => 'password',
        ]);

        User::factory()->create([
            'name' => 'Recepcionista',
            'surname' => 'Central',
            'email' => 'recepcion@habitus.test',
            'dni' => '00000001',
            'telephone' => '+34100000001',
            'rol' => 'receptionist',
            'status' => 'active',
            'password' => 'password',
        ]);
    }

    /**
     * @return Collection<int, User>
     */
    private function createPsychologists(): Collection
    {
        $psychologists = collect([
            ['name' => 'María', 'surname' => 'López', 'email' => 'maria.lopez@habitus.test', 'dni' => '10000001', 'telephone' => '+34110000001'],
            ['name' => 'Carlos', 'surname' => 'García', 'email' => 'carlos.garcia@habitus.test', 'dni' => '10000002', 'telephone' => '+34110000002'],
            ['name' => 'Lucía', 'surname' => 'Martínez', 'email' => 'lucia.martinez@habitus.test', 'dni' => '10000003', 'telephone' => '+34110000003'],
            ['name' => 'Javier', 'surname' => 'Sánchez', 'email' => 'javier.sanchez@habitus.test', 'dni' => '10000004', 'telephone' => '+34110000004'],
            ['name' => 'Ana', 'surname' => 'Ruiz', 'email' => 'ana.ruiz@habitus.test', 'dni' => '10000005', 'telephone' => '+34110000005'],
        ]);

        return $psychologists->map(fn (array $data) => User::factory()->create(array_merge($data, [
            'rol' => 'psychologist',
            'status' => 'active',
            'password' => 'password',
        ])));
    }

    private function createPatientsAndAppointments(Collection $psychologists): void
    {
        $hourSlots = ['08:30:00', '09:30:00', '10:30:00', '11:30:00', '12:30:00', '14:30:00', '15:30:00', '16:30:00'];
        $counter = 200;

        foreach ($psychologists as $psychologistIndex => $psychologist) {
            for ($patientIndex = 1; $patientIndex <= 20; $patientIndex++) {
                $counter++;
                $patient = User::factory()->create([
                    'name' => fake()->firstName(),
                    'surname' => fake()->lastName(),
                    'email' => "patient{$psychologistIndex}_{$patientIndex}@habitus.test",
                    'dni' => (string) $counter,
                    'telephone' => '+34' . fake()->numerify('6#######'),
                    'rol' => 'patient',
                    'status' => 'active',
                    'password' => 'password',
                ]);

                PatientProfile::factory()->create([
                    'user_id' => $patient->id,
                    'birth_date' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
                    'profession' => fake()->jobTitle(),
                    'marital_status' => fake()->randomElement(['single', 'married', 'divorced', 'widowed']),
                    'emergency_phone' => '+34' . fake()->numerify('6#######'),
                    'address' => fake()->streetAddress(),
                    'city' => fake()->city(),
                    'postal_code' => fake()->postcode(),
                    'consultation_reason' => fake()->sentence(10),
                    'psychologist_id' => $psychologist->id,
                ]);

                Appointment::factory()->create([
                    'patient_id' => $patient->id,
                    'psychologist_id' => $psychologist->id,
                    'status' => fake()->randomElement(['pending', 'held']),
                    'date' => fake()->dateTimeBetween('-15 days', '+15 days')->format('Y-m-d'),
                    'hour' => fake()->randomElement($hourSlots),
                ]);
            }
        }
    }

    private function createInactivePatient(User $psychologist): void
    {
        $inactivePatient = User::factory()->create([
            'name' => 'Paciente',
            'surname' => 'Inactivo',
            'email' => 'paciente.inactivo@habitus.test',
            'dni' => '99999999',
            'telephone' => '+34199999999',
            'rol' => 'patient',
            'status' => 'inactive',
            'password' => 'password',
        ]);

        PatientProfile::factory()->create([
            'user_id' => $inactivePatient->id,
            'birth_date' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'profession' => fake()->jobTitle(),
            'marital_status' => fake()->randomElement(['single', 'married', 'divorced', 'widowed']),
            'emergency_phone' => '+34' . fake()->numerify('6#######'),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'consultation_reason' => fake()->sentence(10),
            'psychologist_id' => $psychologist->id,
        ]);

        Appointment::factory()->create([
            'patient_id' => $inactivePatient->id,
            'psychologist_id' => $psychologist->id,
            'status' => 'canceled',
            'date' => fake()->dateTimeBetween('-30 days', '-5 days')->format('Y-m-d'),
            'hour' => '10:00:00',
        ]);
    }
}
