import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateUserDto, UpdateUserDto, User } from '../models/user.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los usuarios
   * - Admin/Recepcionista: todos los usuarios
   * - Psicólogo: solo pacientes
   * - Paciente: sin permiso (403)
   */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Obtiene un usuario por su ID
   * - Paciente: sin permiso
   * - Psicólogo: solo puede ver pacientes
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario
   * - Paciente: sin permiso
   */
  create(user: CreateUserDto): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user);
  }

  /**
   * Actualiza un usuario existente
   * - Paciente: sin permiso
   */
  update(id: number, user: UpdateUserDto): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Elimina un usuario
   * - Paciente: sin permiso
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene usuarios filtrados por rol
   */
  getByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?role=${role}`);
  }

  /**
   * Obtiene todos los psicólogos
   */
  getPsychologists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?role=psychologist`);
  }

  /**
   * Crea un nuevo paciente con perfil
   */
  createPatient(patientData: any): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, patientData);
  }
}
