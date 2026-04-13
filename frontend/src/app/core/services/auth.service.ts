import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, switchMap, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '../../models/auth.models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const user = this.storage.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    console.log('🔐 Starting login for:', credentials.email);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('✅ Login response received:', response);
        console.log('📝 Token length:', response.token?.length);
        console.log('👤 Role from login response:', response.role || (response as any).Role);
        console.log('🔍 Full response object:', JSON.stringify(response, null, 2));
        
        this.storage.setToken(response.token);
        this.storage.setRefreshToken(response.refreshToken);
        
        // Store the role from login response - this is the correct role
        const roleFromLogin = response.role || (response as any).Role;
        console.log('🎭 Extracted role from login:', roleFromLogin);
        
        // Store role separately so we can use it after profile fetch
        this.storage.setItem('loginRole', roleFromLogin);
        
        const tempUser: User = {
          userId: '',
          email: credentials.email,
          firstName: 'User',
          lastName: '',
          role: roleFromLogin,
          phoneNumber: '',
          dateOfBirth: '',
          address: '',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        };
        
        console.log('💾 Storing temporary user:', tempUser);
        this.storage.setUser(tempUser);
        this.currentUserSubject.next(tempUser);
        console.log('✅ Temporary user stored, fetching full profile...');
      }),
      // Fetch full profile after login
      switchMap(() => {
        console.log('🔄 Calling getProfile() to fetch full user details...');
        return this.getProfile();
      }),
      catchError(error => {
        console.error('❌ Login flow error:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error details:', error.error);
        
        if (error.status === 401 && error.url?.includes('/me')) {
          console.warn('⚠️ Profile fetch failed with 401 - token might be invalid');
          console.warn('⚠️ This usually means:');
          console.warn('   1. Admin user does not exist in database');
          console.warn('   2. Token is invalid or expired immediately');
          console.warn('   3. Backend /auth/me endpoint has issues');
        }
        
        throw error;
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  verifyOtp(data: VerifyOtpRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-register-otp`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  getProfile(): Observable<User> {
    console.log('📞 Calling GET /auth/me endpoint...');
    const token = this.storage.getToken();
    console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    // Get the role from login response (stored earlier)
    const roleFromLogin = this.storage.getItem('loginRole');
    console.log('🎭 Role from login (stored):', roleFromLogin);
    
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(userResponse => {
        console.log('✅ Profile response received:', userResponse);
        console.log('🔍 Raw response:', JSON.stringify(userResponse, null, 2));
        
        // Backend returns fullName instead of firstName/lastName
        let firstName = 'User';
        let lastName = '';
        
        if (userResponse.fullName) {
          const nameParts = userResponse.fullName.split(' ');
          firstName = nameParts[0] || 'User';
          lastName = nameParts.slice(1).join(' ') || '';
        } else {
          firstName = userResponse.firstName || userResponse.FirstName || 'User';
          lastName = userResponse.lastName || userResponse.LastName || '';
        }
        
        // WORKAROUND: Backend /auth/me returns empty roles array
        // Use the role from login response instead
        let extractedRole = roleFromLogin || 'Customer';
        console.log('🎭 Using role from login response:', extractedRole);
        
        // Try to get role from profile response (in case backend is fixed later)
        if (userResponse.roles && Array.isArray(userResponse.roles) && userResponse.roles.length > 0) {
          extractedRole = userResponse.roles[0];
          console.log('🎭 Found role in roles array:', extractedRole);
        } else if (userResponse.role) {
          extractedRole = userResponse.role;
          console.log('🎭 Found role in role field:', extractedRole);
        } else if (userResponse.Role) {
          extractedRole = userResponse.Role;
          console.log('🎭 Found role in Role field (PascalCase):', extractedRole);
        } else {
          console.warn('⚠️ No role in profile response, using role from login:', extractedRole);
        }
        
        const user: User = {
          userId: userResponse.userId || userResponse.UserId || '',
          email: userResponse.email || userResponse.Email || '',
          firstName: firstName,
          lastName: lastName,
          role: extractedRole,
          phoneNumber: userResponse.phoneNumber || userResponse.PhoneNumber || '',
          dateOfBirth: userResponse.dateOfBirth || userResponse.DateOfBirth || '',
          address: userResponse.address || userResponse.Address || '',
          isEmailVerified: userResponse.isEmailVerified !== undefined ? userResponse.isEmailVerified : true,
          createdAt: userResponse.createdAt || userResponse.CreatedAt || new Date().toISOString()
        };
        
        console.log('✅ Normalized user:', user);
        console.log('👤 Final user role:', user.role);
        console.log('📧 User email:', user.email);
        console.log('💾 Saving to localStorage...');
        
        this.storage.setUser(user);
        this.currentUserSubject.next(user);
        
        console.log('✅ User saved to localStorage');
        console.log('🔍 Verify - isAdmin():', user.role === 'Admin');
        console.log('🔍 Verify - isCustomer():', user.role === 'Customer');
        
        return user;
      }),
      catchError(error => {
        console.error('❌ GET /auth/me FAILED');
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.error);
        console.error('❌ Request URL:', error.url);
        
        if (error.status === 401) {
          console.error('🚨 401 UNAUTHORIZED - Possible causes:');
          console.error('   1. Token is invalid or malformed');
          console.error('   2. Token expired immediately (check backend token expiry)');
          console.error('   3. User does not exist in database');
          console.error('   4. Backend /auth/me endpoint requires different authentication');
        } else if (error.status === 404) {
          console.error('🚨 404 NOT FOUND - Possible causes:');
          console.error('   1. /auth/me endpoint does not exist');
          console.error('   2. Wrong API URL in environment.ts');
          console.error('   3. Backend routing issue');
        } else if (error.status === 500) {
          console.error('🚨 500 SERVER ERROR - Backend has an internal error');
        } else if (error.status === 0) {
          console.error('🚨 NETWORK ERROR - Possible causes:');
          console.error('   1. Backend is not running');
          console.error('   2. CORS issue');
          console.error('   3. Wrong API URL');
        }
        
        throw error;
      })
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, data).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }

  logout(): void {
    this.storage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.storage.getToken();
  }

  isAdmin(): boolean {
    const user = this.storage.getUser();
    return user?.role === 'Admin';
  }

  isCustomer(): boolean {
    const user = this.storage.getUser();
    return user?.role === 'Customer';
  }

  getCurrentUser(): User | null {
    return this.storage.getUser();
  }

  googleLogin(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  handleGoogleCallback(token: string): void {
    this.storage.setToken(token);
    this.getProfile().subscribe({
      next: () => {
        const user = this.getCurrentUser();
        if (user?.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/customer/dashboard']);
        }
      },
      error: () => {
        this.logout();
      }
    });
  }
}
