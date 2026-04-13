import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const customerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  console.log('🔒 Customer Guard - Checking access');
  console.log('👤 Current user:', user);
  console.log('🎭 User role:', user?.role);
  console.log('✅ Is Customer?', authService.isCustomer());

  if (authService.isCustomer()) {
    console.log('✅ Customer access granted');
    return true;
  }

  console.warn('❌ Customer access denied - redirecting to admin dashboard');
  router.navigate(['/admin/dashboard']);
  return false;
};
