import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

const roleRouteMap: Record<UserRole, string> = {
  admin: '/admin',
  psychologist: '/psychologist',
  receptionist: '/receptionist',
  patient: '/patient'
};

/**
 * Guard que protege rutas que requieren autenticación.
 * Redirige a /login si el usuario no está autenticado.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/login']);
  return false;
};

/**
 * Guard que previene acceso a rutas de auth (login) si ya está autenticado.
 * Redirige al panel correspondiente si el usuario ya está autenticado.
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const role = authService.currentUser()?.rol;
  router.navigate([role ? roleRouteMap[role] : '/']);
  return false;
};
