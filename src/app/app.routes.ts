import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/catalogo/catalogo').then((m) => m.CatalogoPage) },
  { path: 'admin/login', loadComponent: () => import('./features/admin/login/login').then((m) => m.LoginPage) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/panel/panel').then((m) => m.PanelPage),
  },
  { path: '**', redirectTo: '' },
];
