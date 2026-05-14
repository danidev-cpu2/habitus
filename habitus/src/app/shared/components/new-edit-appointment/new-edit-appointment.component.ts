import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-new-edit-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-edit-appointment.component.html',
  styleUrls: ['./new-edit-appointment.css'],
})
export class NewEditAppointment implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() appointmentToEdit?: Appointment | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() appointmentSaved = new EventEmitter<Appointment>();

  psychologists: User[] = [];
  patients: User[] = [];
  filteredPatients: User[] = [];

  selectedPatient: User | null = null;
  selectedPatientId: number | null = null;
  selectedPsychologistId: number | null = null;

  appointmentDate: string = '';
  appointmentHour: string = '09:00';

  duration: number = 60;
  durations: number[] = [30, 45, 60, 90];

  status: AppointmentStatus = 'pending';

  minDate: string = new Date().toISOString().split('T')[0];

  successMessage = '';
  errorMessage = '';

  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.errorMessage = '';
      this.successMessage = '';

      if (this.isEditMode && this.appointmentToEdit) {
        this.patchAppointment(this.appointmentToEdit);
      } else if (!this.isEditMode) {
        this.resetForm();
      }
    }

    if (changes['appointmentToEdit'] && this.isEditMode && this.appointmentToEdit) {
      this.patchAppointment(this.appointmentToEdit);
    }
  }

  private loadUsers(): void {
    this.userService.getPsychologists().subscribe({
      next: (psychologists: User[]) => {
        this.psychologists = psychologists ?? [];
      },
      error: () => {
        this.psychologists = [];
      },
    });

    this.userService.getByRole('patient').subscribe({
      next: (patients: User[]) => {
        this.patients = patients ?? [];
        this.filteredPatients = [...this.patients];
      },
      error: () => {
        this.patients = [];
        this.filteredPatients = [];
      },
    });
  }

  get visiblePsychologists(): User[] {
    if (!this.selectedPatientId) {
      return this.psychologists;
    }

    const patient = this.patients.find((p) => p.id === this.selectedPatientId);
    const psychologistId = this.getPatientPsychologistId(patient);

    if (!psychologistId) {
      return this.psychologists;
    }

    return this.psychologists.filter((psychologist) => psychologist.id === psychologistId);
  }

  get editingPsychologistLabel(): string {
    const psychologist = this.psychologists.find(
      (item) => item.id === this.selectedPsychologistId,
    );

    return psychologist
      ? `${psychologist.name} ${psychologist.surname}`
      : 'Psicólogo no disponible';
  }

  get editingPatientLabel(): string {
    const patient = this.patients.find((item) => item.id === this.selectedPatientId);

    return patient
      ? `${patient.name} ${patient.surname}`
      : 'Paciente no disponible';
  }

  private getPatientPsychologistId(patient?: User | null): number | null {
    return (
      patient?.patient_profile?.psychologist_id ??
      patient?.patientProfile?.psychologist_id ??
      null
    );
  }

  onPsychologistChange(): void {
    if (!this.selectedPsychologistId) {
      this.filteredPatients = [...this.patients];
      return;
    }

    this.filteredPatients = this.patients.filter(
      (patient) =>
        this.getPatientPsychologistId(patient) === this.selectedPsychologistId,
    );

    if (
      this.selectedPatientId &&
      !this.filteredPatients.some((patient) => patient.id === this.selectedPatientId)
    ) {
      this.selectedPatientId = null;
      this.selectedPatient = null;
    }
  }

  onPatientChange(): void {
    const patient = this.patients.find((p) => p.id === this.selectedPatientId);

    if (!patient) {
      this.selectedPatient = null;
      this.selectedPsychologistId = null;
      this.filteredPatients = [...this.patients];
      return;
    }

    this.selectedPatient = patient;
    this.selectedPsychologistId = this.getPatientPsychologistId(patient);
    this.filteredPatients = [...this.patients];
  }

  filterPatients(): void {

    this.filteredPatients = this.patients.filter((patient) => {
      const matchesPsychologist =
        !this.selectedPsychologistId ||
        this.getPatientPsychologistId(patient) === this.selectedPsychologistId;

      const fullName = `${patient.name ?? ''} ${patient.surname ?? ''}`
        .trim()
        .toLowerCase();

      return matchesPsychologist;
    });
  }

  validateWeekDay(): void {
    if (!this.appointmentDate) {
      return;
    }

    const [year, month, day] = this.appointmentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      this.errorMessage = 'Solo se permiten citas de lunes a viernes.';
      this.appointmentDate = '';
    } else {
      this.errorMessage = '';
    }
  }

  closeModal(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.close.emit();
  }

  saveAppointment(): void {
    const patientId = this.selectedPatientId ?? this.appointmentToEdit?.patient_id ?? null;
    const psychologistId = this.selectedPsychologistId ?? this.appointmentToEdit?.psychologist_id ?? null;

    if (!patientId || !psychologistId || !this.appointmentDate || !this.appointmentHour) {
      this.errorMessage = 'Debes completar paciente, psicólogo, fecha y hora.';
      return;
    }

    this.validateWeekDay();
    if (!this.appointmentDate) {
      return;
    }

    const payload = {
      patient_id: patientId,
      psychologist_id: psychologistId,
      date: this.appointmentDate,
      hour: this.appointmentHour,
      status: this.status,
    };

    const request = this.isEditMode && this.appointmentToEdit?.id
      ? this.appointmentService.update(this.appointmentToEdit.id, payload)
      : this.appointmentService.create(payload);

    request.subscribe({
      next: (response: { data: Appointment; message: string }) => {
        this.successMessage = response.message ?? 'Cita guardada correctamente.';
        this.errorMessage = '';
        this.appointmentSaved.emit(response.data);

        if (!this.isEditMode) {
          this.resetForm();
        }
      },
      error: (error: any) => {
        this.errorMessage =
          error?.error?.message ||
          'No se pudo guardar la cita. Revisa los datos e intenta de nuevo.';
        this.successMessage = '';
      },
    });
  }

  private patchAppointment(appointment: Appointment): void {
    this.selectedPatientId = appointment.patient_id;
    this.selectedPsychologistId = appointment.psychologist_id;
    this.appointmentDate = appointment.date;
    this.appointmentHour = appointment.hour;
    this.status = appointment.status;
    this.selectedPatient = this.patients.find((item) => item.id === appointment.patient_id) ?? null;
    this.filteredPatients = [...this.patients];
  }

  private resetForm(): void {
    this.selectedPatient = null;
    this.selectedPatientId = null;
    this.selectedPsychologistId = null;
    this.appointmentDate = '';
    this.appointmentHour = '09:00';
    this.duration = 60;
    this.status = 'pending';
    this.filteredPatients = [...this.patients];
  }
}
