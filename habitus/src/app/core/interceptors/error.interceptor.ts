import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Interceptor que maneja errores HTTP de forma centralizada.
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor';
          break;
        case 400:
          errorMessage = error.error?.message || 'Solicitud incorrecta';
          break;
        case 401:
          errorMessage = error.error?.message || 'Credenciales incorrectas';
          break;
        case 403:
          errorMessage = error.error?.message || 'No tienes permiso para realizar esta acción';
          router.navigate(['/unauthorized']);
          break;
        case 404:
          errorMessage = error.error?.message || 'Recurso no encontrado';
          break;
        case 422:
          errorMessage = error.error?.message || 'Error de validación';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || `Error: ${error.status}`;
      }

      // Puedes usar un servicio de notificaciones aquí
      console.error('HTTP Error:', errorMessage, error);

      // Re-lanzamos el error con el mensaje procesado
      return throwError(() => ({
        ...error,
        message: errorMessage,
        originalError: error,
      }));
    })
  );
};
