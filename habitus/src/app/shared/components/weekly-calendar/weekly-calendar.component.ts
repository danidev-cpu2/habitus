import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Clock, CircleCheck, CircleX, BadgeCheck, CalendarX, LucideIconData } from 'lucide-angular';

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

interface AppointmentHourGroup {
  hour: string;
  appointments: Appointment[];
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './weekly-calendar.component.html',
})
export class WeeklyCalendarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  readonly isPatient = this.authService.hasRole('patient');
  readonly isPsychologist = this.authService.hasRole('psychologist');
  readonly currentUser = this.authService.currentUser();

  isAppointmentModalOpen = false;
  isEditMode = false;
  selectedAppointmentToEdit: Appointment | null = null;
  recentAppointmentMessage = '';
  currentMonth = '';
  currentDate = new Date();

  appointments: Appointment[] = [];

  readonly CalendarX = CalendarX;

selectedDayIndex = 0; // índice dentro de currentWeek

selectDay(index: number) {
  this.selectedDayIndex = index;
}

getAppointmentsForSelectedDay() {
  const allDays = this.getAppointmentsByDay();
  return allDays[this.selectedDayIndex] ?? [];
}

  readonly statusIcons: Record<AppointmentStatus, LucideIconData> = {
    pending: Clock,
    confirmed: CircleCheck,
    canceled: CircleX,
    held: CircleCheck,
  };

  readonly statusIconColors: Record<AppointmentStatus, string> = {
    pending: 'text-amber-500',
    confirmed: 'text-emerald-500',
    canceled: 'text-red-500',
    held: 'text-emerald-500',
  };

  readonly statusLabels: Record<AppointmentStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    canceled: 'Cancelada',
    held: 'Confirmada',
  };

  readonly statusBadgeClasses: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-50 text-amber-600',
    confirmed: 'bg-emerald-50 text-emerald-600',
    canceled: 'bg-red-50 text-red-500 line-through',
    held: 'bg-emerald-50 text-emerald-600',
  };

  psychologistColors = [
    { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-600', dot: 'bg-blue-400' },
    { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-400' },
    { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-600', dot: 'bg-violet-400' },
    { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-600', dot: 'bg-pink-400' },
    { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  ];

  currentWeek: {
    dayName: string;
    dayNumber: number;
    fullDate: Date;
    isToday: boolean;
  }[] = [];

  private refreshSub!: Subscription;

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.generateCurrentWeek(this.currentDate);
    this.loadAppointments();
    this.refreshSub = this.appointmentService.refresh$.subscribe(() => this.loadAppointments());
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadAppointments(): void {
    this.appointmentService.getAll().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('error:', err),
    });
  }

  getAppointmentsByDay(): AppointmentHourGroup[][] {
    const days = this.currentWeek.map((day) => day.fullDate);
    return days.map((day) => {
      const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const dayAppointments = this.appointments
        .filter((app) => app.date.substring(0, 10) === dayStr)
        .sort((a, b) => a.hour.localeCompare(b.hour));

      const grouped: Record<string, Appointment[]> = {};
      dayAppointments.forEach((app) => {
        const hour = app.hour.substring(0, 5);
        if (!grouped[hour]) {
          grouped[hour] = [];
        }
        grouped[hour].push(app);
      });

      return Object.keys(grouped)
        .sort()
        .map((hour) => ({
          hour,
          appointments: grouped[hour],
        }));
    });
  }

  getActivePsychologists(): { id: number; name: string; surname: string; color: { bg: string; border: string; text: string; dot: string } }[] {
    const active: Record<number, { id: number; name: string; surname: string }> = {};

    this.appointments.forEach((appointment) => {
      const psychologist = appointment.psychologist;
      if (!psychologist) {
        return;
      }

      if (!active[psychologist.id]) {
        active[psychologist.id] = {
          id: psychologist.id,
          name: psychologist.name,
          surname: psychologist.surname,
        };
      }
    });

    return Object.values(active).map((psychologist, index) => ({
      ...psychologist,
      color: this.psychologistColors[index % this.psychologistColors.length],
    }));
  }

  getPsychologistColor(appointment: Appointment) {
    const psychologistId = appointment.psychologist?.id;
    const active = this.getActivePsychologists();
    const found = active.find((psychologist) => psychologist.id === psychologistId);

    return found?.color ?? this.psychologistColors[0];
  }

  handleAppointmentCreated(appointment: any): void {
    const formattedDate = this.formatAppointmentDate(appointment.date);
    this.recentAppointmentMessage = `Cita creada para ${formattedDate} a las ${appointment.hour}`;
    this.isAppointmentModalOpen = false;
    this.isEditMode = false;
    this.selectedAppointmentToEdit = null;
    this.loadAppointments(); // recargar citas
  }

  openAppointmentForEdit(appointment: Appointment): void {
    this.selectedAppointmentToEdit = appointment;
    this.isEditMode = true;
    this.isAppointmentModalOpen = true;
  }

  closeAppointmentModal(): void {
    this.isAppointmentModalOpen = false;
    this.isEditMode = false;
    this.selectedAppointmentToEdit = null;
  }

  formatAppointmentDate(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    const formatted = new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
    }).format(date);

    return formatted.replace(/\b\w/, (char) => char.toUpperCase());
  }

  generateCurrentWeek(baseDate: Date): void {
    const today = new Date();

    this.currentMonth = baseDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });

    // 0 domingo, 1 lunes...
    const currentDay = baseDate.getDay();

    // Obtener lunes
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(baseDate);

    monday.setDate(baseDate.getDate() + diffToMonday);

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

    this.currentWeek = [];

    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);

      date.setDate(monday.getDate() + i);

      this.currentWeek.push({
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        fullDate: date,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
  }

  previousWeek(): void {
    const newDate = new Date(this.currentDate);

    newDate.setDate(newDate.getDate() - 7);

    this.currentDate = newDate;

    this.generateCurrentWeek(this.currentDate);
  }

  nextWeek(): void {
    const newDate = new Date(this.currentDate);

    newDate.setDate(newDate.getDate() + 7);

    this.currentDate = newDate;

    this.generateCurrentWeek(this.currentDate);
  }

  goToToday(): void {
    this.currentDate = new Date();

    this.generateCurrentWeek(this.currentDate);
  }

}
