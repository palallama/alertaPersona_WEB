import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideMenu, 
  lucideDownload, 
  lucideAlarmCheck, 
  lucideUsers, 
  lucideLineChart, 
  lucideSend 
} from '@ng-icons/lucide';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from '@core/interceptors/auth-interceptor';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideIcons({ 
      lucideMenu, 
      lucideDownload, 
      lucideAlarmCheck, 
      lucideUsers, 
      lucideLineChart, 
      lucideSend 
    }),
    providePrimeNG({
      theme: {
          preset: Aura,
          options: {
            darkModeSelector: '.my-app-dark'
          }
      }
    }),
  ]
};
