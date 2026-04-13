import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { AuthResponse, LoginCredentials, LogoutResponse } from '../models/auth.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}`;

  // Signals para el estado de autenticación
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private isAuthenticatedSignal = signal<boolean>(this.hasValidToken());

  // Computed signals públicos
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.rol ?? null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.setSession(response.data.token, response.data.user);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError((error) => {
        // Limpiamos la sesión aunque falle el logout en el servidor
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra sesión localmente sin llamar al servidor
   */
  logoutLocal(): void {
    this.clearSession();
  }

  /**
   * Obtiene el token de autenticación almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Verifica si el usuario tiene uno de los roles especificados
   */
  hasRole(roles: string | string[]): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.rol);
  }

  /**
   * Verifica si el usuario está activo
   */
  isUserActive(): boolean {
    const user = this.currentUserSignal();
    return user?.status === 'active';
  }

  /**
   * Actualiza los datos del usuario actual en el storage
   */
  updateCurrentUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  // Métodos privados

  private setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
