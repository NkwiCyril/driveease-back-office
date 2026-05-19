import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }
  // Back office is admin-only — block regular/merchant users.
  if (!auth.isAdmin()) {
    auth.clear();
    router.navigate(['/auth/login'], { queryParams: { reason: 'forbidden' } });
    return false;
  }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isSuperAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
