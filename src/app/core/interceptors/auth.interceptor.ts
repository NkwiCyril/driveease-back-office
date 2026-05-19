import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Attaches `Authorization: Bearer <token>` when we have one, and on a 401
 * response clears local auth state and bounces to /auth/login. The backend
 * enforces a single active session, so a 401 here almost always means
 * "logged in elsewhere" or "token revoked".
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const authed = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.endsWith('/users/login') && !req.url.endsWith('/users/verify-otp')) {
        auth.clear();
        router.navigate(['/auth/login'], { queryParams: { reason: 'session-expired' } });
      }
      return throwError(() => err);
    })
  );
};
