import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';

interface AppointmentView {
  id: number;
  date: string;
  dayLabel: string;
  timeRange: string;
  type: string;
  doctorName: string;
  specialty: string;
  location: string;
  daysUntil: number;
  status: 'pendiente' | 'confirmada' | 'cancelada';
}

@Component({
  selector: 'app-index-pax',
  imports: [CommonModule],
  templateUrl: './index-pax.component.html',
})
export class IndexPaxComponent {
  private readonly router             = inject(Router);
  private readonly appointmentService = inject(AppointmentService);

  readonly nextAppointment = signal<AppointmentView | null>({
    id: 1,
    date: '2026-05-16',
    dayLabel: 'Martes, 21 de Enero',
    timeRange: '10:00 - 11:00',
    type: 'Sesión Individual',
    doctorName: 'Dr. Carlos Mendoza',
    specialty: 'Terapia Cognitivo-Conductual',
    location: 'Consultorio 3',
    daysUntil: 2,
    status: 'pendiente',
  });

  readonly isModalOpen = signal(false);
  readonly isLoading   = signal(false);

  readonly daysLabel = computed(() => {
    const apt = this.nextAppointment();
    if (!apt) return '';
    return apt.daysUntil === 0
      ? 'Hoy'
      : apt.daysUntil === 1
        ? 'Mañana'
        : `En ${apt.daysUntil} días`;
  });

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  confirmAppointment(): void {
    const apt = this.nextAppointment();
    if (!apt) return;

    this.isLoading.set(true);
    this.appointmentService.updateStatus(apt.id, 'confirmed').subscribe({
      next: () => {
        this.nextAppointment.set({ ...apt, status: 'confirmada' });
        this.isLoading.set(false);
        this.closeModal();
      },
      error: () => {
        this.isLoading.set(false);
        this.closeModal();
      },
    });
  }

  cancelAppointment(): void {
    const apt = this.nextAppointment();
    if (!apt) return;

    this.isLoading.set(true);
    this.appointmentService.updateStatus(apt.id, 'canceled').subscribe({
      next: () => {
        this.nextAppointment.set(null);
        this.isLoading.set(false);
        this.closeModal();
      },
      error: () => {
        this.isLoading.set(false);
        this.closeModal();
      },
    });
  }

  goToCalendar(): void {
    this.router.navigate(['/patient/calendario']);
  }
}
