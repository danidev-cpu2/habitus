import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas basándose en el rol del usuario.
 *
 * Uso en las rutas:
 * ```typescript
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { roles: ['admin'] }
 * }
 * ```
 *
 * También puede aceptar múltiples roles:
 * ```typescript
 * {
 *   path: 'management',
 *   canActivate: [roleGuard],
 *   data: { roles: ['admin', 'receptionist'] }
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primero verificamos si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Obtenemos los roles permitidos de la configuración de la ruta
  const allowedRoles = route.data['roles'] as UserRole[];

  if (!allowedRoles || allowedRoles.length === 0) {
    // Si no se especifican roles, permitir acceso
    return true;
  }

  // Verificamos si el usuario tiene alguno de los roles permitidos
  if (authService.hasRole(allowedRoles)) {
    return true;
  }

  // Si no tiene el rol adecuado, redirigir al login o al panel propio
  const user = authService.currentUser();
  const redirectRoute = user?.rol ? `/${user.rol}` : '/login';
  router.navigate([redirectRoute]);
  return false;
};

/**
 * Guard específico para rutas de administrador
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasRole('admin')) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};

/**
 * Guard que permite acceso a admin y recepcionista
 */
export const staffGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasRole(['admin', 'receptionist'])) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};

/**
 * Guard que bloquea el acceso a pacientes
 */
export const noPatientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!authService.hasRole('patient')) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
