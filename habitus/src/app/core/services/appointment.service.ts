import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) { }

  create(payload: CreateAppointmentDto): Observable<{ data: Appointment; message: string }> {
    return this.http.post<{ data: Appointment; message: string }>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdateAppointmentDto): Observable<{ data: Appointment; message: string }> {
    return this.http.put<{ data: Appointment; message: string }>(`${this.apiUrl}/${id}`, payload);
  }
}
