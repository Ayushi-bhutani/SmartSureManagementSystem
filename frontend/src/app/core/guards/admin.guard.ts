import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  console.log('🔒 Admin Guard - Checking access');
  console.log('👤 Current user:', user);
  console.log('🎭 User role:', user?.role);
  console.log('✅ Is Admin?', authService.isAdmin());

  if (authService.isAdmin()) {
    console.log('✅ Admin access granted');
    return true;
  }

  console.warn('❌ Admin access denied - redirecting to customer dashboard');
  console.warn('💡 If you updated role in database, please logout and login again');
  router.navigate(['/customer/dashboard']);
  return false;
};
