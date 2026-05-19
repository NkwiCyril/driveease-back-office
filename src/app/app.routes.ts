import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage),
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/users/user-details.page').then((m) => m.UserDetailsPage),
      },
      {
        path: 'cars',
        loadComponent: () => import('./pages/cars/cars.page').then((m) => m.CarsPage),
      },
      {
        path: 'cars/:id',
        loadComponent: () => import('./pages/cars/car-details.page').then((m) => m.CarDetailsPage),
      },
      {
        path: 'adverts',
        loadComponent: () => import('./pages/adverts/adverts.page').then((m) => m.AdvertsPage),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/bookings/bookings.page').then((m) => m.BookingsPage),
      },
      {
        path: 'ai-queue',
        loadComponent: () => import('./pages/ai-queue/ai-queue.page').then((m) => m.AiQueuePage),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.page').then((m) => m.ReportsPage),
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles.page').then((m) => m.RolesPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/audit/audit.page').then((m) => m.AuditPage),
      },
      {
        path: 'seed-tools',
        loadComponent: () => import('./pages/seed-tools/seed-tools.page').then((m) => m.SeedToolsPage),
      },
      {
        path: 'admin/profile',
        loadComponent: () => import('./pages/admin-profile/admin-profile.page').then((m) => m.AdminProfilePage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
