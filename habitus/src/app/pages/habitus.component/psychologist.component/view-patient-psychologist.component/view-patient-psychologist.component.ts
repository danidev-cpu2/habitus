import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

type PatientTab = 'historial' | 'notas' | 'controlConductual' | 'resumenIA';

@Component({
  selector: 'app-view-patient-psychologist',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './view-patient-psychologist.component.html',
  styleUrls: ['./view-patient-psychologist.component.css'],
})
export class ViewPatientPsychologistComponent implements OnInit {
  isLoading = signal(true);
  error = signal<string | null>(null);

  private patientData = signal<User | null>(null);

  selectedTab = signal<PatientTab>('historial');

  private loadedKey = '';

  patient = computed(() => this.patientData());

  psychologist = computed(() => this.authService.currentUser());

  fullName = computed(() => {
    const patient = this.patient();

    if (!patient) return '';

    return `${patient.name ?? ''} ${patient.surname ?? ''}`.trim() || 'Paciente sin nombre';
  });

  isActive = computed(() => {
    return this.patient()?.status === 'active';
  });

  statusLabel = computed(() => {
    return this.isActive() ? 'Activo' : 'Inactivo';
  });

  diagnosis = computed(() => {
    const patient = this.patient() as any;

    return (
      patient?.patient_profile?.consultation_reason ||
      patient?.patientProfile?.consultation_reason ||
      ''
    );
  });

  dni = computed(() => {
    return this.patient()?.dni || 'No especificado';
  });

  email = computed(() => {
    return this.patient()?.email || 'No especificado';
  });

  telephone = computed(() => {
    const patient = this.patient() as any;

    return (
      patient?.telephone ||
      patient?.phone ||
      patient?.patient_profile?.telephone ||
      patient?.patientProfile?.telephone ||
      patient?.patient_profile?.phone ||
      patient?.patientProfile?.phone ||
      'No especificado'
    );
  });

  age = computed(() => {
    const patient = this.patient() as any;

    const birthDate =
      patient?.patient_profile?.birth_date ||
      patient?.patientProfile?.birth_date ||
      patient?.patient_profile?.birthDate ||
      patient?.patientProfile?.birthDate ||
      patient?.patient_profile?.date_of_birth ||
      patient?.patientProfile?.date_of_birth;

    if (!birthDate) {
      return 'No especificada';
    }

    const age = this.getAge(birthDate);

    return age > 0 ? `${age} años` : 'No especificada';
  });

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    /**
     * Esto evita que la página intente cargar el paciente
     * antes de que exista el usuario psicólogo autenticado.
     */
    effect(() => {
      const currentUser = this.authService.currentUser();
      const idParam = this.route.snapshot.paramMap.get('id');

      if (!idParam) {
        this.error.set('Paciente no especificado');
        this.isLoading.set(false);
        return;
      }

      const patientId = Number(idParam);

      if (Number.isNaN(patientId)) {
        this.error.set('Identificador de paciente no válido');
        this.isLoading.set(false);
        return;
      }

      if (!currentUser?.id) {
        this.isLoading.set(true);
        return;
      }

      const key = `${patientId}-${currentUser.id}`;

      if (this.loadedKey === key) {
        return;
      }

      this.loadedKey = key;
      this.loadPatient(patientId, currentUser.id);
    });
  }

  ngOnInit(): void {}

  private loadPatient(patientId: number, psychologistId: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.patientData.set(null);
    this.selectedTab.set('historial');

    this.userService.getAll().subscribe({
      next: (users) => {
        const patients = users.filter((user) => {
          const userAny = user as any;

          const isPatient = user.rol === 'patient';

          const belongsToMe =
            userAny.patient_profile?.psychologist_id === psychologistId ||
            userAny.patientProfile?.psychologist_id === psychologistId;

          return isPatient && belongsToMe;
        });

        const patient = patients.find((user) => Number(user.id) === patientId);

        console.log('PACIENTE ENCONTRADO:', patient);
        console.log('patient_profile:', (patient as any)?.patient_profile);
        console.log('patientProfile:', (patient as any)?.patientProfile);

        console.log('birth_date:', (patient as any)?.patient_profile?.birth_date);
        console.log('birthDate:', (patient as any)?.patient_profile?.birthDate);
        console.log('date_of_birth:', (patient as any)?.patient_profile?.date_of_birth);

        console.log('birth_date camel relation:', (patient as any)?.patientProfile?.birth_date);
        console.log('birthDate camel relation:', (patient as any)?.patientProfile?.birthDate);
        console.log(
          'date_of_birth camel relation:',
          (patient as any)?.patientProfile?.date_of_birth,
        );

        if (!patient) {
          this.error.set('Paciente no encontrado');
          this.patientData.set(null);
          this.isLoading.set(false);
          return;
        }

        this.patientData.set(patient);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar paciente:', err);
        this.error.set('No se pudo cargar la información del paciente. Inténtalo de nuevo.');
        this.patientData.set(null);
        this.isLoading.set(false);
      },
    });
  }

  selectTab(tab: PatientTab): void {
    this.selectedTab.set(tab);
  }

  retry(): void {
    this.loadedKey = '';

    const currentUser = this.authService.currentUser();
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.error.set('Paciente no especificado');
      this.isLoading.set(false);
      return;
    }

    const patientId = Number(idParam);

    if (Number.isNaN(patientId)) {
      this.error.set('Identificador de paciente no válido');
      this.isLoading.set(false);
      return;
    }

    if (!currentUser?.id) {
      this.isLoading.set(true);
      return;
    }

    this.loadPatient(patientId, currentUser.id);
  }

  getAge(birthDate?: string): number {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);

    if (Number.isNaN(birth.getTime())) return 0;

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}
