import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NewEditAppointment } from '../../../../shared/components/new-edit-appointment/new-edit-appointment.component';

@Component({
    selector: 'app-index-recep',
    standalone: true,
    imports: [CommonModule, NewEditAppointment],
    templateUrl: './index-recep.component.html',
    styleUrls: ['./index-recep.component.css'],
})
export class IndexRecepComponent {
    isAppointmentModalOpen = false;
    recentAppointmentMessage = '';

    handleAppointmentCreated(appointment: any): void {
        this.recentAppointmentMessage = `Cita creada para ${appointment.date} a las ${appointment.hour}`;
        this.isAppointmentModalOpen = false;
    }
}
