import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page.component/landing-page.component';
import { LoginComponent } from './pages/login.component/login.component';
import { HabitusComponent } from './pages/habitus.component/habitus.component';
import { AdminComponent } from './pages/habitus.component/admin.component/admin.component';
import { UserList } from './pages/habitus.component/admin.component/user-list/user-list';
import { AddUsers } from './pages/habitus.component/admin.component/add-users/add-users';
import { PatientComponent } from './pages/habitus.component/patient.component/patient.component';
import { IndexPaxComponent } from './pages/habitus.component/patient.component/index-pax.component/index-pax.component';
import { PsychologistComponent } from './pages/habitus.component/psychologist.component/psychologist.component';
import { IndexPsychologistComponent } from './pages/habitus.component/psychologist.component/index-psychologist.component/index-psychologist.component';
import { ReceptionistComponent } from './pages/habitus.component/receptionist.component/receptionist.component';
import { IndexRecepComponent } from './pages/habitus.component/receptionist.component/index-recep.component/index-recep.component';
import { CreatePaxComponent } from './pages/habitus.component/receptionist.component/create-pax.component/create-pax.component';
import { TransferPaxComponent } from './pages/habitus.component/receptionist.component/transfer-pax.component/transfer-pax.component';
import { Calendario } from './pages/habitus.component/admin.component/calendario/calendario';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const patientChildrenRoutes: Routes = [
  {
    path: '',
    component: PatientComponent,
    canActivate: [roleGuard],
    data: { roles: ['patient'] },
    children: [
      {
        path: '',
        component: IndexPaxComponent,
      },
    ],
  },
];

const receptionistChildrenRoutes: Routes = [
  {
    path: '',
    component: ReceptionistComponent,
    canActivate: [roleGuard],
    data: { roles: ['receptionist'] },
    children: [
      {
        path: '',
        component: IndexRecepComponent,
      },
      {
        path: 'alta-paciente',
        component: CreatePaxComponent,
      },
      {
        path: 'transferir',
        component: TransferPaxComponent,
      },
    ],
  },
];

const psychologistChildrenRoutes: Routes = [
  {
    path: '',
    component: PsychologistComponent,
    canActivate: [roleGuard],
    data: { roles: ['psychologist'] },
    children: [
      {
        path: '',
        component: IndexPsychologistComponent,
      },
    ],
  },
];

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard],
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
        data: { roles: ['admin'] },
      },
      {
        path: 'usuarios/:id/editar',
        component: AddUsers,
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'usuarios/:id/editar',
        component: AddUsers,
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'usuarios',
        component: UserList,
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'usuarios/nuevo',
        component: AddUsers,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'calendario',
        component: Calendario,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },
  {
    path: 'patient',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [...patientChildrenRoutes],
  },
  {
    path: 'paciente',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [...patientChildrenRoutes],
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
        data: { roles: ['psychologist'] },
        children: [
          {
            path: '',
            component: IndexPsychologistComponent,
          },
        ],
      }
    ]
  },
  {
    path: 'receptionist',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [...receptionistChildrenRoutes],
  },
  {
    path: 'psicologo',
    redirectTo: 'psychologist',
    pathMatch: 'full',
  },
  {
    path: 'recepcion',
    component: HabitusComponent,
    canActivate: [authGuard],
    children: [...receptionistChildrenRoutes],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
