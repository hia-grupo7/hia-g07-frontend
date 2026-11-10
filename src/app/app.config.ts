import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor'; // <-- Ruta de tu archivo

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // Habilitamos el HttpClient y le decimos que use los interceptores definidos en la DI (Dependency Injection)
    provideHttpClient(withInterceptorsFromDi()), 
    
    
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};