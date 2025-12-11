import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorHandelrInterceptor: HttpInterceptorFn = (req, next) => {
  const _router = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 404) {

_router.navigate(['/not-found'])
      }
      else if (error.status === 401 || error.status === 403) {

        _router.navigate(['/login'])
      }
      else {
        alert('somthing went wrong');
      }


      return throwError(() => error);
    })
  );
};
