import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Si estamos en el servidor (SSR), permitir el acceso
  // El componente se renderizará y luego en el navegador se verificará
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = authService.getAccessToken();

  // Si no hay token, redirige al login
  if (!token) {
    router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Verifica que el token sea válido
  return authService.verifyToken().pipe(
    map(isValid => {
      if (!isValid) {
        router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
      return true;
    })
  );
};
