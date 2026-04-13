import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../services/storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const storage = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      console.log('🔴 HTTP Error Interceptor caught error:', {
        url: error.url,
        status: error.status,
        statusText: error.statusText,
        message: error.message
      });

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        if (error.status === 401) {
          // Check if this is a /auth/me call during login
          const isProfileCall = error.url?.includes('/auth/me');
          const isLoginCall = error.url?.includes('/auth/login');
          
          console.log('🔴 401 Unauthorized:', {
            isProfileCall,
            isLoginCall,
            url: error.url
          });
          
          // Only clear storage and redirect if NOT during initial login flow
          if (!isLoginCall) {
            if (isProfileCall) {
              errorMessage = 'Unable to fetch user profile. Please check if your account exists.';
              console.error('🚨 Profile fetch failed - admin user might not exist in database');
            } else {
              errorMessage = 'Session expired. Please login again.';
            }
            
            storage.clear();
            router.navigate(['/auth/login']);
          } else {
            errorMessage = 'Invalid email or password.';
          }
        } else if (error.status === 403) {
          errorMessage = 'Access denied. You do not have permission.';
        } else if (error.status === 404) {
          errorMessage = 'Resource not found.';
          console.error('🔴 404 Not Found:', error.url);
        } else if (error.status === 400) {
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            const errors = Object.values(error.error.errors).flat();
            errorMessage = errors.join(', ');
          } else {
            errorMessage = 'Invalid request.';
          }
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if backend is running.';
          console.error('🔴 Network Error - Backend might be down');
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toastr.error(errorMessage, 'Error');
      return throwError(() => error);
    })
  );
};
