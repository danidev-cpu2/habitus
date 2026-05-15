import { Component, OnInit } from '@angular/core';
import { WeeklyCalendarComponent } from "../../../../shared/components/weekly-calendar/weekly-calendar.component";
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../../services/appointment.service';

@Component({
  selector: 'app-psycho-calendar.component',
  imports: [WeeklyCalendarComponent],
  templateUrl: './psycho-calendar.component.html',
  styleUrl: './psycho-calendar.component.css',
})
export class PsychoCalendarComponent implements OnInit {
  psychologistAppointments: Appointment[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

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
