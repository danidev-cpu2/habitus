import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/usuarios/:id/editar',
    renderMode: RenderMode.Client,
  },
  {
    path: 'psychologist/pacientes/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'psicologo/pacientes/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
