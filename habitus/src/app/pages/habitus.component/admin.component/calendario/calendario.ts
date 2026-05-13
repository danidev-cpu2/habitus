import { Component, OnInit, signal } from '@angular/core';
import { WeeklyCalendarComponent } from '../../../../shared/components/weekly-calendar/weekly-calendar.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment, getMockAppointments } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [WeeklyCalendarComponent],
  templateUrl: './calendario.html',
})
export class Calendario implements OnInit {
  readonly appointments = signal<Appointment[]>([]);

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    // TODO: reemplazar por llamada real al backend cuando el endpoint esté disponible.
    // this.appointmentService.getByWeek(weekStartIso).subscribe(data => this.appointments.set(data));
    this.appointments.set(getMockAppointments());
  }

  /**
   * TODO (pendiente de otro dev): abrir el formulario/modal de nueva cita.
   * El servicio `AppointmentService.create(dto)` ya está preparado para la llamada HTTP.
   */
  onNewAppointment(): void {
    // placeholder — no implementar aquí
  }
}
