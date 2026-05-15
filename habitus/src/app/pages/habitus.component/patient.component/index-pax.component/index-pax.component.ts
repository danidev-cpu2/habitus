import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AptDisplayStatus = 'pendiente' | 'confirmada' | 'realizada';

export interface AppointmentView {
  id: number;
  date: string;
  dayLabel: string;
  shortDate: string;
  timeRange: string;
  doctorName: string;
  status: AptDisplayStatus;
}

// ─── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-index-pax',
  imports: [CommonModule],
  templateUrl: './index-pax.component.html',
})
export class IndexPaxComponent implements OnInit {

  private readonly router             = inject(Router);
  private readonly appointmentService = inject(AppointmentService);

  // ─── Estado ──────────────────────────────────────────────────────────────────

  /** Todas las citas futuras no canceladas */
  private readonly _all = signal<AppointmentView[]>([]);

  /** Solo pendientes → sección superior */
  readonly pending = computed(() => this._all().filter(a => a.status === 'pendiente'));

  /** Todas (pendiente + confirmada + realizada) → agenda inferior */
  readonly agenda  = computed(() => this._all());

  readonly selectedApt = signal<AppointmentView | null>(null);
  readonly isModalOpen = signal(false);
  readonly isLoading   = signal(false);
  readonly feedbackMsg = signal('');
  readonly feedbackOk  = signal(true);

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        const views = data
          .filter(a => a.status !== 'canceled')
          .map(a => this.mapToView(a));
        this._all.set(views);
      },
      error: () => this._all.set([]),
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  daysDiff(apt: AppointmentView): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round(
      (new Date(apt.date + 'T00:00:00').getTime() - today.getTime()) / 86_400_000
    );
  }

  isPast(apt: AppointmentView): boolean {
    return this.daysDiff(apt) < 0;
  }

  dayBadge(apt: AppointmentView): { classes: string; text: string } {
    const d = this.daysDiff(apt);
    if (d > 1)  return { classes: 'bg-blue-50 text-blue-600',   text: `En ${d} días` };
    if (d === 1) return { classes: 'bg-blue-50 text-blue-600',   text: 'Mañana' };
    if (d === 0) return { classes: 'bg-amber-50 text-amber-600', text: 'Hoy' };
    return        { classes: 'bg-red-50 text-red-600',    text: `Hace ${Math.abs(d)} días` };
  }

  readonly statusCfg: Record<AptDisplayStatus, { badge: string; label: string }> = {
    pendiente:  { badge: 'bg-amber-50 text-amber-600',   label: 'Pendiente'  },
    confirmada: { badge: 'bg-emerald-50 text-emerald-600', label: 'Confirmada' },
    realizada:  { badge: 'bg-blue-50 text-blue-600',     label: 'Realizada'  },
  };

  // ─── Modal ────────────────────────────────────────────────────────────────────

  openModal(apt: AppointmentView): void {
    this.selectedApt.set(apt);
    this.feedbackMsg.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedApt.set(null);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────────

  setStatus(apiStatus: AppointmentStatus): void {
    const apt = this.selectedApt();
    if (!apt) return;

    this.isLoading.set(true);
    this.appointmentService.updateStatus(apt.id, apiStatus).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeModal();
        this.appointmentService.triggerRefresh();
        this.loadAll();
        this.feedbackMsg.set('✓ Estado actualizado correctamente.');
        this.feedbackOk.set(true);
      },
      error: () => {
        this.feedbackMsg.set('No se pudo actualizar la cita. Inténtalo de nuevo.');
        this.feedbackOk.set(false);
        this.isLoading.set(false);
      },
    });
  }

  cancelFromAgenda(apt: AppointmentView): void {
    this.openModal(apt);
  }

  goToCalendar(): void {
    this.router.navigate(['/patient/calendario']);
  }

  // ─── Mapeo ────────────────────────────────────────────────────────────────────

  private mapToView(apt: Appointment): AppointmentView {
    const statusMap: Record<string, AptDisplayStatus> = {
      pending:   'pendiente',
      confirmed: 'confirmada',
      held:      'realizada',
    };

    const dateStr = apt.date.substring(0, 10);
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj   = new Date(y, m - 1, d);

    const dayLabel = dateObj.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    const shortDate = dateObj.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short',
    });

    const timeRange = apt.end_time
      ? `${apt.hour.substring(0, 5)} - ${apt.end_time.substring(0, 5)}`
      : apt.hour.substring(0, 5);

    return {
      id:        apt.id,
      date:      dateStr,
      dayLabel:  dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      shortDate: shortDate.charAt(0).toUpperCase() + shortDate.slice(1),
      timeRange,
      doctorName: apt.psychologist
        ? `${apt.psychologist.name} ${apt.psychologist.surname}`
        : 'Psicólogo asignado',
      status: statusMap[apt.status] ?? 'pendiente',
    };
  }
}
