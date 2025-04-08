import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter} from '@angular/router';
import {routes} from './app/app.routes';
import {provideHttpClient} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {environment} from './environments/environment';
import {enableProdMode} from '@angular/core';
import {provideServiceWorker} from '@angular/service-worker';

if (environment.production) {
  enableProdMode();
}
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    environment.production ? provideServiceWorker('ngsw-worker.js'): []
  ]
}).catch(err => console.error(err));
