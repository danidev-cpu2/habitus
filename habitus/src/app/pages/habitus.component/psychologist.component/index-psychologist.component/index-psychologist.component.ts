import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../../services/appointment.service';

@Component({
  selector: 'app-index-psychologist',
  standalone: true,
  imports: [CommonModule, LucideAngularModule,],
  templateUrl: './index-psychologist.component.html',
  styleUrl: './index-psychologist.component.css',
})
export class IndexPsychologistComponent implements OnInit {
  readonly activePatientsCount = signal<number | null>(null);
  todayAppointmentsCount = signal<number>(0);
  todayScheduleAppointments = signal<Appointment[]>([]);
  recentPatients = signal<User[]>([]);

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.loadActivePatientsCount();
    this.loadTodayScheduleAppointments();
    this.loadRecentPatients();
  }

  get psychologistName(): string {
    const user = this.authService.currentUser();
    if (!user) {
      return 'Dr. Psicólogo';
    }
    return `Dr. ${user.name} ${user.surname}`.trim();
  }

  get currentDateLabel(): string {
    return this.formatTodayLabel(new Date());
  }

  private formatTodayLabel(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
  }

  private loadActivePatientsCount(): void {
    const psychologistId = this.authService.currentUser()?.id;
    if (!psychologistId) {
      this.activePatientsCount.set(null);
      return;
    }

    this.userService.getByRole('patient').subscribe({
      next: (data: User[]) => {
        const activePatients = (data ?? []).filter((patient) => {
          const patientPsychologistId =
            patient.patient_profile?.psychologist_id ??
            patient.patientProfile?.psychologist_id;
          return patient.status === 'active' && patientPsychologistId === psychologistId;
        });
        this.activePatientsCount.set(activePatients.length);
      },
      error: () => {
        this.activePatientsCount.set(null);
      },
    });
  }

  private loadTodayScheduleAppointments(): void {
    const psychologistId = this.authService.currentUser()?.id;
    if (!psychologistId) {
      this.todayAppointmentsCount.set(0);
      this.todayScheduleAppointments.set([]);
      return;
    }

    const today = this.getTodayDateString();
    this.appointmentService.getAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        const todays = (appointments ?? [])
          .filter((appointment) => {
            const appointmentDate = appointment.date?.split('T')[0] ?? appointment.date;
            return (
              appointment.psychologist_id === psychologistId &&
              appointmentDate === today
            );
          })
          .sort((a, b) => (a.hour ?? '').localeCompare(b.hour ?? ''));

        this.todayScheduleAppointments.set(todays);
        this.todayAppointmentsCount.set(todays.length);
      },
      error: () => {
        this.todayScheduleAppointments.set([]);
        this.todayAppointmentsCount.set(0);
      },
    });
  }

  private loadRecentPatients(): void {
    const psychologistId = this.authService.currentUser()?.id;
    if (!psychologistId) {
      this.recentPatients.set([]);
      return;
    }

    this.userService.getByRole('patient').subscribe({
      next: (data: User[]) => {
        const recent = (data ?? [])
          .filter((patient) => {
            const patientPsychologistId =
              patient.patient_profile?.psychologist_id ??
              patient.patientProfile?.psychologist_id;
            return patientPsychologistId === psychologistId;
          })
          .sort((a, b) => {
            const aDate = a.created_at ?? '';
            const bDate = b.created_at ?? '';
            return bDate.localeCompare(aDate);
          })
          .slice(0, 4);

        this.recentPatients.set(recent);
      },
      error: () => {
        this.recentPatients.set([]);
      },
    });
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getAppointmentStatusClass(status: string): string {
    switch (status) {
      case 'held':
        return 'border-emerald-100 bg-emerald-50 text-emerald-700';
      case 'canceled':
        return 'border-red-100 bg-red-50 text-red-700';
      default:
        return 'border-amber-100 bg-amber-50 text-amber-700';
    }
  }

  getAppointmentStatusLabel(status: string): string {
    return status === 'held'
      ? 'Confirmada'
      : status === 'canceled'
        ? 'Cancelada'
        : 'Pendiente';
  }

  getPatientInitials(patient: User): string {
    const first = patient.name?.trim()?.[0] ?? '';
    const second = patient.surname?.trim()?.[0] ?? '';
    return `${first}${second}`.toUpperCase() || 'P';
  }

  getPatientAssignedLabel(patient: User): string {
    const assignedAt = patient.created_at;
    if (!assignedAt) {
      return 'Asignado recientemente';
    }

    const date = new Date(assignedAt);
    return `Asignado ${new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
    }).format(date)}`;
  }
}
