import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentStatus, CreateAppointmentDto, UpdateAppointmentDto } from '../models/appointment.model';
import { ApiResponse } from '../models/auth.model';

export interface AppointmentFilters {
  /** Fecha inicial del rango (YYYY-MM-DD) */
  from?: string;
  /** Fecha final del rango (YYYY-MM-DD) */
  to?: string;
  psychologist_id?: number;
  patient_id?: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene citas con filtros opcionales.
   * En una misma hora pueden coincidir varios psicólogos: el backend devuelve
   * todas las citas sin aplanar por slot.
   */
  getAll(filters: AppointmentFilters = {}): Observable<Appointment[]> {
    let params = new HttpParams();
    if (filters.from)             params = params.set('from',             filters.from);
    if (filters.to)               params = params.set('to',               filters.to);
    if (filters.psychologist_id)  params = params.set('psychologist_id',  filters.psychologist_id);
    if (filters.patient_id)       params = params.set('patient_id',       filters.patient_id);
    if (filters.status)           params = params.set('status',           filters.status);
    return this.http.get<Appointment[]>(this.apiUrl, { params });
  }

  /**
   * Shortcut para cargar la semana completa del calendario.
   * @param weekStart Lunes de la semana en formato YYYY-MM-DD
   */
  getByWeek(weekStart: string): Observable<Appointment[]> {
    const from = weekStart;
    const to = this.addDays(weekStart, 6);
    return this.getAll({ from, to });
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva cita.
   * TODO (asignado a otro dev): conectar con el formulario de nueva cita.
   */
  create(dto: CreateAppointmentDto): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateAppointmentDto): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, dto);
  }

  updateStatus(id: number, status: AppointmentStatus): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
