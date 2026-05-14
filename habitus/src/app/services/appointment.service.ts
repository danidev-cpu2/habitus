import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id: number;
  patient_id: number;
  psychologist_id: number;
  status: string;
  date: string; // formato ISO
  hour: string; // formato HH:MM:SS
  created_at: string;
  updated_at: string;
  patient: {
    id: number;
    name: string;
    surname: string;
    status: string;
  };
  psychologist: {
    id: number;
    name: string;
    surname: string;
    status: string;
  };
  // otros campos según el modelo
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8000/api/appointments'; // ajustar según la URL de la API

  constructor(private http: HttpClient) { }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
