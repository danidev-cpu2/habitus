import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page.component/landing-page.component';
import { LoginComponent } from './pages/login.component/login.component';
import { HabitusComponent } from './pages/habitus.component/habitus.component';
import { AdminComponent } from './pages/habitus.component/admin.component/admin.component';
import { PatientComponent } from './pages/habitus.component/patient.component/patient.component';
import { PsychologistComponent } from './pages/habitus.component/psychologist.component/psychologist.component';
import { ReceptionistComponent } from './pages/habitus.component/receptionist.component/receptionist.component';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'admin',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AdminComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },
  {
    path: 'patient',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: PatientComponent,
        canActivate: [roleGuard],
        data: { roles: ['patient'] }
      }
    ]
  },
  {
    path: 'psychologist',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: PsychologistComponent,
        canActivate: [roleGuard],
        data: { roles: ['psychologist'] }
      }
    ]
  },
  {
    path: 'receptionist',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ReceptionistComponent,
        canActivate: [roleGuard],
        data: { roles: ['receptionist'] }
      }
    ]
  },
  {
    path: 'paciente',
    redirectTo: 'patient',
    pathMatch: 'full'
  },
  {
    path: 'psicologo',
    redirectTo: 'psychologist',
    pathMatch: 'full'
  },
  {
    path: 'recepcion',
    redirectTo: 'receptionist',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
