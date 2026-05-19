import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AppointmentService, Appointment } from '../../../../services/appointment.service';
import { WeeklyCalendarComponent } from "../../../../shared/components/weekly-calendar/weekly-calendar.component";
import { NewEditAppointment } from "../../../../shared/components/new-edit-appointment/new-edit-appointment.component";

@Component({
  selector: 'app-index-recep',
  standalone: true,
  imports: [CommonModule, WeeklyCalendarComponent, NewEditAppointment],
  templateUrl: './index-recep.component.html',
  styleUrls: ['./index-recep.component.css'],
})
export class IndexRecepComponent implements OnInit {
  isAppointmentModalOpen = false;
  recentAppointmentMessage = '';
  currentMonth = '';
  currentDate = new Date();
  isEditMode = false;
  appointmentToEdit: Appointment | null = null;

  appointments: Appointment[] = [];

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

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.generateCurrentWeek(this.currentDate);
    this.loadAppointments();
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

  openNewModal() {
    this.isEditMode = false;
    this.appointmentToEdit = null;
    this.isAppointmentModalOpen = true;
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments: any) => {
        this.appointments = appointments;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('error:', err),
    });
  }

  getAppointmentsByDay(): Appointment[][] {
    const days = this.currentWeek.map((day) => day.fullDate);
    return days.map((day) => {
      const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const found = this.appointments.filter((app) => {
        const appDateStr = app.date.substring(0, 10);
        return appDateStr === dayStr;
      });
      return found;
    });
  }

  getActivePsychologists(): { id: number; name: string; surname: string; color: { bg: string; border: string; text: string; dot: string } }[] {
    const active: Record<number, { id: number; name: string; surname: string }> = {};

    this.appointments.forEach((appointment) => {
      const psychologist = appointment.psychologist;
      if (!psychologist || psychologist.status !== 'active') {
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
    this.recentAppointmentMessage = `Cita creada para ${appointment.date} a las ${appointment.hour}`;
    this.isAppointmentModalOpen = false;
    this.loadAppointments(); // recargar citas
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
