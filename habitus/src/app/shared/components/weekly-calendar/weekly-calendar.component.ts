import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, computed, signal } from '@angular/core';
import { Appointment, AppointmentType } from '../../../core/models/appointment.model';

/** Cita enriquecida con posición visual dentro de la celda del calendario */
interface CalendarEvent {
  apt: Appointment;
  /** 0=lun … 6=dom relativo a la semana visible */
  dayOffset: number;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  /** Índice de columna dentro de la celda (para citas simultáneas) */
  colIndex: number;
  /** Total de citas en la misma celda (hora + día) */
  colTotal: number;
}

interface WeekDay {
  offset: number;
  shortName: string;
  date: number;
  isToday: boolean;
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-calendar.component.html',
})
export class WeeklyCalendarComponent implements OnChanges {
  /** Título principal */
  @Input() title = 'Calendario';
  /** Subtítulo descriptivo */
  @Input() subtitle = '';
  /**
   * Citas a mostrar. Usa fechas absolutas (`date`, `start_time`, `end_time`).
   * El componente calcula automáticamente la posición en la semana visible.
   * En una misma hora pueden existir varias citas de distintos psicólogos.
   */
  @Input() appointments: Appointment[] = [];
  /** Opciones para el desplegable "Filtrar por" */
  @Input() filterOptions: string[] = ['Todos los empleados'];
  /**
   * Se emite al pulsar "+ Nueva Cita".
   * La lógica del formulario es responsabilidad del componente padre / otro dev.
   */
  @Output() newAppointment = new EventEmitter<void>();

  readonly HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  readonly DAY_NAMES = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  readonly ROW_H = 56;

  readonly weekStart = signal<Date>(this.getMonday(new Date()));
  readonly selectedFilter = signal<string>('');

  readonly weekDays = computed<WeekDay[]>(() => {
    const start = this.weekStart();
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        offset: i,
        shortName: this.DAY_NAMES[i],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      };
    });
  });

  readonly currentMonthYear = computed(() => {
    const start = this.weekStart();
    const label = start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  /**
   * Convierte las citas al modelo de visualización:
   * - Calcula dayOffset desde la fecha absoluta vs. semana visible.
   * - Descarta citas fuera del rango visible.
   * - Asigna colIndex/colTotal para citas simultáneas (mismo día + misma hora de inicio).
   *   Así varios psicólogos con citas a la misma hora se muestran en columnas paralelas.
   */
  readonly calendarEvents = computed<CalendarEvent[]>(() => {
    const weekStartDate = this.weekStart();

    const events: CalendarEvent[] = this.appointments
      .map((apt): CalendarEvent | null => {
        const dayOffset = this.getDayOffset(apt.date, weekStartDate);
        if (dayOffset < 0 || dayOffset > 6) return null;

        const [startHour, startMin] = apt.start_time.split(':').map(Number);
        const [endHour, endMin]     = apt.end_time.split(':').map(Number);

        return { apt, dayOffset, startHour, startMin, endHour, endMin, colIndex: 0, colTotal: 1 };
      })
      .filter((e): e is CalendarEvent => e !== null);

    // Agrupar por celda (día + hora de inicio) para asignar columnas paralelas
    const cellMap = new Map<string, CalendarEvent[]>();
    for (const evt of events) {
      const key = `${evt.dayOffset}-${evt.startHour}`;
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key)!.push(evt);
    }
    cellMap.forEach((group) => {
      group.forEach((evt, i) => {
        evt.colIndex = i;
        evt.colTotal = group.length;
      });
    });

    return events;
  });

  ngOnChanges(): void {
    if (this.filterOptions.length && !this.selectedFilter()) {
      this.selectedFilter.set(this.filterOptions[0]);
    }
  }

  getEventsFor(dayOffset: number, hour: number): CalendarEvent[] {
    return this.calendarEvents().filter(
      (e) => e.dayOffset === dayOffset && e.startHour === hour,
    );
  }

  /**
   * Estilo de posición absoluta para cada cita:
   * - top/height: calculados desde hora/minuto.
   * - left/width: divididos equitativamente cuando hay varias citas en la misma celda.
   */
  getApptStyle(evt: CalendarEvent): { [key: string]: string } {
    const top        = (evt.startMin / 60) * this.ROW_H;
    const durationMin = (evt.endHour - evt.startHour) * 60 + (evt.endMin - evt.startMin);
    const height     = (durationMin / 60) * this.ROW_H - 4;

    const leftPct  = (evt.colIndex / evt.colTotal) * 100;
    const widthPct = (1 / evt.colTotal) * 100;

    return {
      top:    `${top}px`,
      height: `${height}px`,
      left:   `calc(${leftPct}% + 2px)`,
      width:  `calc(${widthPct}% - 4px)`,
    };
  }

  apptClasses(type: AppointmentType): string {
    switch (type) {
      case 'individual': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'grupal':     return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'evaluacion': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    }
  }

  dotClass(type: AppointmentType): string {
    switch (type) {
      case 'individual': return 'bg-blue-500';
      case 'grupal':     return 'bg-emerald-500';
      case 'evaluacion': return 'bg-yellow-400';
    }
  }

  patientLabel(apt: Appointment): string {
    if (apt.patient) return `${apt.patient.name} ${apt.patient.surname}`.trim();
    return `Paciente #${apt.patient_id}`;
  }

  psychologistLabel(apt: Appointment): string {
    if (apt.psychologist) return `${apt.psychologist.name} ${apt.psychologist.surname}`.trim();
    return `Psicólogo #${apt.psychologist_id}`;
  }

  formatTime(hour: number, min: number): string {
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  prevWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
  }

  goToToday(): void {
    this.weekStart.set(this.getMonday(new Date()));
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getDayOffset(dateStr: string, weekStart: Date): number {
    const apptDate = new Date(dateStr + 'T00:00:00');
    const diffMs   = apptDate.getTime() - weekStart.getTime();
    return Math.round(diffMs / 86_400_000);
  }
}
