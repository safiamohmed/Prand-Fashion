import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _auth = inject(AuthService);
  const token = _auth.getToken();
  if (token) {
    const cloned = req.clone({
      //هنا باخد نسخة من الريكوست وبعد ما يتعمل عليه يتعدل عليه
      setHeaders: {
        Authorization: `Bearer ${token}`,
      }, //مينفعش بعد ما الريكوست يتعمل يتعدل عليه
    });
    return next(cloned);
  }
  return next(req);
};
