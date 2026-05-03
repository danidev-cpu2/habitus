import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Solo una importación de Lucide y sus iconos
import {
  LucideAngularModule,
  Brain, Menu, X, Home, Calendar, BookOpen,
  CheckSquare, LayoutDashboard, Users, UserPlus,
  ArrowLeftRight, MessageSquare, LogOut
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        Brain, Menu, X, Home, Calendar, BookOpen,
        CheckSquare, LayoutDashboard, Users, UserPlus,
        ArrowLeftRight, MessageSquare, LogOut
      })
    )
  ]
};
