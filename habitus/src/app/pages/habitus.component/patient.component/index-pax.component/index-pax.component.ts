import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';

// ─── Tipos e Interfaces ───────────────────────────────────────────────────────

/** Estados posibles de una cita desde el punto de vista del frontend */
export type AppointmentLocalStatus = 'pendiente' | 'confirmada' | 'cancelada';

/**
 * Representa una cita tal y como se muestra en la vista del paciente.
 * Es un DTO de presentación: no es el modelo del backend, sino lo que
 * necesita la UI para renderizar la tarjeta de próxima cita.
 */
export interface AppointmentView {
  id: number;
  /** Fecha en formato ISO YYYY-MM-DD. Se usa para calcular los días restantes */
  date: string;
  /** Etiqueta legible para mostrar en la UI, p. ej. "Martes, 21 de Enero" */
  dayLabel: string;
  /** Rango horario de la cita, p. ej. "10:00 - 11:00" */
  timeRange: string;
  type: string;
  doctorName: string;
  specialty: string;
  location: string;
  status: AppointmentLocalStatus;
}

/** Configuración del badge de estado que se muestra en la tarjeta */
interface BadgeConfig {
  /** Clases de Tailwind para el color del badge */
  classes: string;
  /** Texto que muestra el badge */
  text: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-index-pax',
  imports: [CommonModule],
  templateUrl: './index-pax.component.html',
})
export class IndexPaxComponent {

  // Servicios inyectados con la nueva API inject() de Angular 14+
  private readonly router             = inject(Router);
  private readonly appointmentService = inject(AppointmentService);

  /** Clave bajo la que se persiste la cita en localStorage */
  private static readonly STORAGE_KEY = 'habitus_next_appointment';

  // ─── Persistencia en localStorage ──────────────────────────────────────────

  /**
   * Carga la cita almacenada en localStorage.
   * Si no existe o el JSON es inválido, devuelve la cita por defecto.
   */
  private loadFromStorage(): AppointmentView | null {
    try {
      const raw = localStorage.getItem(IndexPaxComponent.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppointmentView) : this.defaultAppointment();
    } catch {
      return this.defaultAppointment();
    }
  }

  /**
   * Guarda la cita en localStorage.
   * Si se pasa null (cita cancelada), guarda la cadena 'null'
   * para diferenciarla de "clave inexistente".
   */
  private saveToStorage(apt: AppointmentView | null): void {
    if (apt === null) {
      localStorage.setItem(IndexPaxComponent.STORAGE_KEY, 'null');
    } else {
      localStorage.setItem(IndexPaxComponent.STORAGE_KEY, JSON.stringify(apt));
    }
  }

  /**
   * Cita de ejemplo/placeholder que se usa como fallback cuando
   * no hay datos persistidos o se produce un error de parseo.
   */
  private defaultAppointment(): AppointmentView {
    return {
      id: 1,
      date: '2026-01-21',
      dayLabel: 'Martes, 21 de Enero',
      timeRange: '10:00 - 11:00',
      type: 'Sesión Individual',
      doctorName: 'Dr. Carlos Mendoza',
      specialty: 'Terapia Cognitivo-Conductual',
      location: 'Consultorio 3',
      status: 'pendiente',
    };
  }

  // ─── Estado reactivo (Signals) ──────────────────────────────────────────────

  /**
   * Señal principal: la próxima cita del paciente.
   * null significa que no hay cita activa (p. ej. tras cancelar).
   * Se inicializa desde localStorage al arrancar el componente.
   */
  readonly nextAppointment = signal<AppointmentView | null>(this.loadFromStorage());

  /** Controla la visibilidad del modal de acciones (confirmar/cancelar) */
  readonly isModalOpen  = signal(false);

  /** Indica que hay una operación asíncrona en curso (cancelación) */
  readonly isLoading    = signal(false);

  /** Mensaje de feedback que se muestra al usuario tras una acción */
  readonly syncMessage  = signal('');

  // ─── Señales computadas ─────────────────────────────────────────────────────

  /**
   * Diferencia en días enteros entre hoy y la fecha de la cita.
   * - Positivo → cita futura
   * - 0        → cita hoy
   * - Negativo → cita pasada
   *
   * Nota: se fuerza medianoche en ambas fechas para evitar
   * diferencias horarias al comparar solo días.
   */
  readonly daysDiff = computed<number>(() => {
    const apt = this.nextAppointment();
    if (!apt) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Se añade T00:00:00 para que el constructor de Date no aplique UTC
    const apptDate = new Date(apt.date + 'T00:00:00');
    return Math.round((apptDate.getTime() - today.getTime()) / 86_400_000);
  });

  /**
   * Configuración del badge de estado derivada del estado de la cita y daysDiff.
   * Prioridad: estado explícito (confirmada/cancelada) → días restantes.
   */
  readonly badge = computed<BadgeConfig>(() => {
    const apt = this.nextAppointment();
    if (!apt) return { classes: '', text: '' };

    if (apt.status === 'confirmada') {
      return { classes: 'bg-emerald-50 text-emerald-600', text: 'Confirmada ✓' };
    }
    if (apt.status === 'cancelada') {
      return { classes: 'bg-red-50 text-red-500', text: 'Cancelada' };
    }

    // Para citas pendientes, el badge refleja la proximidad temporal
    const diff = this.daysDiff();
    if (diff > 1)   return { classes: 'bg-blue-50 text-blue-600',   text: `En ${diff} días` };
    if (diff === 1) return { classes: 'bg-blue-50 text-blue-600',   text: 'Mañana' };
    if (diff === 0) return { classes: 'bg-amber-50 text-amber-600', text: 'Hoy' };
    return           { classes: 'bg-red-50 text-red-600', text: `Hace ${Math.abs(diff)} días` };
  });

  /**
   * True si la cita pendiente ya ha pasado (fecha anterior a hoy).
   * Útil para deshabilitar acciones o mostrar advertencias en la plantilla.
   */
  readonly isPast = computed(() =>
    this.daysDiff() < 0 && this.nextAppointment()?.status === 'pendiente'
  );

  // ─── Acciones del modal ─────────────────────────────────────────────────────

  openModal(): void  { this.isModalOpen.set(true); }
  closeModal(): void { this.isModalOpen.set(false); }

  /**
   * Confirma la cita de forma optimista:
   * 1. Actualiza el estado local y persiste en localStorage inmediatamente.
   * 2. Lanza la petición al backend en segundo plano.
   * 3. Si el backend falla, hace rollback al estado anterior.
   *
   * Esto evita que el usuario perciba latencia en la UI.
   */
  confirmAppointment(): void {
    const apt = this.nextAppointment();
    if (!apt) return;

    const confirmed = { ...apt, status: 'confirmada' as const };
    this.nextAppointment.set(confirmed);
    this.saveToStorage(confirmed);
    this.syncMessage.set('✓ Cita confirmada y sincronizada con tu calendario.');
    this.closeModal();

    this.appointmentService.updateStatus(apt.id, 'confirmed').subscribe({
      error: () => {
        // Rollback: si el servidor rechaza la confirmación, revertimos
        this.nextAppointment.set(apt);
        this.saveToStorage(apt);
        this.syncMessage.set('');
      },
    });
  }

  /**
   * Cancela la cita llamando al backend.
   * A diferencia de confirmAppointment, aquí NO se aplica optimistic update:
   * se espera la respuesta del servidor antes de limpiar el estado local.
   *
   * Nota: tanto en éxito como en error se elimina la cita localmente,
   * lo que sugiere que la cancelación se trata como definitiva en ambos casos.
   * Revisar si esto es el comportamiento deseado.
   */
  cancelAppointment(): void {
    const apt = this.nextAppointment();
    if (!apt) return;

    this.isLoading.set(true);
    this.appointmentService.updateStatus(apt.id, 'canceled').subscribe({
      next: () => {
        this.nextAppointment.set(null);
        this.saveToStorage(null);
        this.isLoading.set(false);
        this.closeModal();
      },
      error: () => {
        // ⚠️ En error también se elimina la cita local — verificar si es intencional
        this.nextAppointment.set(null);
        this.saveToStorage(null);
        this.isLoading.set(false);
        this.closeModal();
      },
    });
  }

  /** Navega a la vista del calendario del paciente */
  goToCalendar(): void {
    this.router.navigate(['/patient/calendario']);
  }
}
