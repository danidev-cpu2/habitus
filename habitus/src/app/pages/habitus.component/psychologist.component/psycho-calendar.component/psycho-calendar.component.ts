import { Component, OnInit } from '@angular/core';
import { WeeklyCalendarComponent } from "../../../../shared/components/weekly-calendar/weekly-calendar.component";
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../../services/appointment.service';
import { NewEditAppointment } from "../../../../shared/components/new-edit-appointment/new-edit-appointment.component";

@Component({
  selector: 'app-psycho-calendar.component',
  imports: [WeeklyCalendarComponent, NewEditAppointment],
  templateUrl: './psycho-calendar.component.html',
  styleUrl: './psycho-calendar.component.css',
})
export class PsychoCalendarComponent implements OnInit {
  psychologistAppointments: Appointment[] = [];
  isLoading = true;
  isAppointmentModalOpen = false;
  isEditMode = false;
  appointmentToEdit: Appointment | null = null;

  get currentPsychologistId(): number | null {
    const user = this.authService.currentUser();
    return user?.rol === 'psychologist' ? user.id : null;
  }

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) { }


  handleAppointmentCreated($event: any) {
    this.isAppointmentModalOpen = false;
    this.isEditMode = false;
    this.appointmentToEdit = null;
    this.loadPsychologistAppointments();
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
  openNewModal() {
    this.isEditMode = false;
    this.appointmentToEdit = null;
    this.isAppointmentModalOpen = true;
  }

  ngOnInit(): void {
    this.loadPsychologistAppointments();
  }

  loadPsychologistAppointments(): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser || !currentUser.id) {
      console.error('No hay usuario autenticado');
      this.isLoading = false;
      return;
    }


    this.appointmentService.getAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        // Filtrar solo las citas del psicólogo actual
        this.psychologistAppointments = appointments.filter(
          (apt) => apt.psychologist_id === currentUser.id
        );
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar citas:', err);
        this.isLoading = false;
      },
    });
  }
}
