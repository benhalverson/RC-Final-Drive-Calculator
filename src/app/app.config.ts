import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { Update } from './update';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideServiceWorker('ngsw-worker.js', {
            enabled: isDevMode(),
            registrationStrategy: 'registerImmediately'
          }),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
      progressBar: true,
    }),
    provideAppInitializer(() => inject(Update).init())
  ]
};
