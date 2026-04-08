import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const requestWithCredentials = req.clone({ withCredentials: true });

  return next(requestWithCredentials).pipe(
    catchError(err => {
      const isAuthEndpoint =
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/logout');

      if (err.status === 401 && !isAuthEndpoint) {
        return authService.refresh().pipe(
          switchMap(() => next(req.clone({ withCredentials: true }))),
          catchError(() => {
            authService.logout();
            return EMPTY;
          })
        );
      }

      return throwError(() => err);
    })
  );
};
