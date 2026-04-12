import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.storage.setToken(response.token);
        this.storage.setRefreshToken(response.refreshToken);
        const user: User = {
          userId: response.userId,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          phoneNumber: '',
          dateOfBirth: '',
          address: '',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        };
        this.storage.setUser(user);
        this.currentUserSubject.next(user);
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
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.storage.setUser(user);
        this.currentUserSubject.next(user);
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
