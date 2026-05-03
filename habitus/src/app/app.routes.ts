import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page.component/landing-page.component';
import { LoginComponent } from './pages/login.component/login.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
