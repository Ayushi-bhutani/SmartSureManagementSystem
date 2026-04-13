import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'verify-otp',
        loadComponent: () => import('./features/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: 'google/callback',
        loadComponent: () => import('./features/auth/google-callback/google-callback.component').then(m => m.GoogleCallbackComponent)
      }
    ]
  },
  {
    path: 'customer',
    canActivate: [authGuard, customerGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/customer/dashboard/dashboard.component').then(m => m.CustomerDashboardComponent)
      },
      {
        path: 'policies',
        loadComponent: () => import('./features/customer/policies/policy-list.component').then(m => m.PolicyListComponent)
      },
      {
        path: 'policies/:id',
        loadComponent: () => import('./features/customer/policies/policy-detail.component').then(m => m.PolicyDetailComponent)
      },
      {
        path: 'buy-policy',
        loadComponent: () => import('./features/customer/policies/buy-policy.component').then(m => m.BuyPolicyComponent)
      },
      {
        path: 'claims',
        loadComponent: () => import('./features/customer/claims/claim-list.component').then(m => m.ClaimListComponent)
      },
      {
        path: 'claims/:id',
        loadComponent: () => import('./features/customer/claims/claim-detail.component').then(m => m.ClaimDetailComponent)
      },
      {
        path: 'initiate-claim',
        loadComponent: () => import('./features/customer/claims/initiate-claim.component').then(m => m.InitiateClaimComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/customer/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      // TODO: Uncomment these routes as components are created
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent)
      },
      {
        path: 'policies',
        loadComponent: () => import('./features/admin/policies/policy-list/policy-list.component').then(m => m.AdminPolicyListComponent)
      },
      {
        path: 'insurance-types',
        loadComponent: () => import('./features/admin/policies/insurance-management/insurance-management.component').then(m => m.InsuranceManagementComponent)
      },
      {
        path: 'discounts',
        loadComponent: () => import('./features/admin/discounts/discount-management/discount-management.component').then(m => m.DiscountManagementComponent)
      },
      {
        path: 'claims',
        loadComponent: () => import('./features/admin/claims/claim-list/claim-list.component').then(m => m.AdminClaimListComponent)
      },
      {
        path: 'claims/:id/review',
        loadComponent: () => import('./features/admin/claims/claim-review/claim-review.component').then(m => m.ClaimReviewComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/report-list/report-list.component').then(m => m.ReportListComponent)
      },
      {
        path: 'reports/generate',
        loadComponent: () => import('./features/admin/reports/generate-report/generate-report.component').then(m => m.GenerateReportComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./features/admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
