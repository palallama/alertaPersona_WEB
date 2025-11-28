
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  // Endpoints públicos que NO necesitan token
  const publicEndpoints = [
    '/auth/login',
    '/auth/crearUsuario',
    '/auth/refresh'
  ];

  // Verificar si la URL es pública
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // Si es un endpoint público, no agregamos el token
  if (isPublicEndpoint) {
    return next(req);
  }

  // Si el request ya tiene la marca de intento de refresh, no lo reintentes
  if (req.headers.get('X-Refresh-Attempt')) {
    // Si el refresh falló, cerramos sesión directamente
    authService.logout();
    router.navigateByUrl('/login');
    return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Refresh token expired' }));
  }

  // Agregamos el token al header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Si la petición que devolvió 401 es la del refresh token → no reintentamos
        // (evita bucle cuando el refresh token también expiró)
        if (req.url && req.url.includes('/auth/refresh')) {
          authService.logout();
          router.navigateByUrl('/login');
          return throwError(() => error);
        }

        // Intentamos renovar el token
        return authService.refreshToken().pipe(
          switchMap((newToken: any) => {
            // Guardamos el nuevo token y repetimos la request
            authService.setAccessToken(newToken.accessToken);

            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken.accessToken}`
              }
            });

            return next(newAuthReq);
          }),
          catchError(refreshError => {
            // Si falla el refresh token → cerramos sesión
            authService.logout();
            router.navigateByUrl('/login');
            return throwError(() => refreshError);
          })
        );
      }

      // Otros errores
      return throwError(() => error);
    })
  );
};
