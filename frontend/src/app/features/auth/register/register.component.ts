import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-header">
            <mat-icon class="auth-icon">person_add</mat-icon>
            <h1>Create Account</h1>
            <p>Join SmartSure today</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Personal Information -->
            <mat-step [stepControl]="personalInfoForm">
              <form [formGroup]="personalInfoForm">
                <ng-template matStepLabel>Personal Information</ng-template>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" placeholder="John">
                    <mat-icon matPrefix>person</mat-icon>
                    <mat-error *ngIf="personalInfoForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" placeholder="Doe">
                    <mat-icon matPrefix>person</mat-icon>
                    <mat-error *ngIf="personalInfoForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="john.doe@example.com">
                  <mat-icon matPrefix>email</mat-icon>
                  <mat-error *ngIf="personalInfoForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="personalInfoForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber" placeholder="+1 234 567 8900">
                  <mat-icon matPrefix>phone</mat-icon>
                  <mat-error *ngIf="personalInfoForm.get('phoneNumber')?.hasError('required')">
                    Phone number is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="dateOfBirth">
                  <mat-icon matPrefix>cake</mat-icon>
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="personalInfoForm.get('dateOfBirth')?.hasError('required')">
                    Date of birth is required
                  </mat-error>
                </mat-form-field>

                <div class="stepper-buttons">
                  <button mat-raised-button color="primary" matStepperNext 
                          [disabled]="personalInfoForm.invalid">
                    Next
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Address & Password -->
            <mat-step [stepControl]="accountInfoForm">
              <form [formGroup]="accountInfoForm">
                <ng-template matStepLabel>Account Details</ng-template>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Address</mat-label>
                  <textarea matInput formControlName="address" rows="3" 
                            placeholder="123 Main St, City, State, ZIP"></textarea>
                  <mat-icon matPrefix>home</mat-icon>
                  <mat-error *ngIf="accountInfoForm.get('address')?.hasError('required')">
                    Address is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" 
                         formControlName="password" placeholder="Enter password">
                  <mat-icon matPrefix>lock</mat-icon>
                  <button mat-icon-button matSuffix type="button" 
                          (click)="hidePassword = !hidePassword">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="accountInfoForm.get('password')?.hasError('required')">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="accountInfoForm.get('password')?.hasError('minlength')">
                    Password must be at least 6 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirm Password</mat-label>
                  <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" 
                         formControlName="confirmPassword" placeholder="Confirm password">
                  <mat-icon matPrefix>lock</mat-icon>
                  <button mat-icon-button matSuffix type="button" 
                          (click)="hideConfirmPassword = !hideConfirmPassword">
                    <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="accountInfoForm.get('confirmPassword')?.hasError('required')">
                    Please confirm your password
                  </mat-error>
                  <mat-error *ngIf="accountInfoForm.hasError('passwordMismatch')">
                    Passwords do not match
                  </mat-error>
                </mat-form-field>

                <div class="stepper-buttons">
                  <button mat-button matStepperPrevious type="button">
                    <mat-icon>arrow_back</mat-icon>
                    Back
                  </button>
                  <button mat-raised-button color="primary" type="button"
                          (click)="onSubmit()" [disabled]="accountInfoForm.invalid || isLoading">
                    <span *ngIf="!isLoading">Register</span>
                    <span *ngIf="isLoading">Registering...</span>
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>

          <div class="login-link">
            Already have an account? 
            <a routerLink="/auth/login">Sign In</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 600px;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .auth-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #3f51b5;
      margin-bottom: 16px;
    }

    .auth-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .auth-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }

    .stepper-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    .login-link {
      text-align: center;
      margin-top: 24px;
      color: #666;
      font-size: 14px;
    }

    .login-link a {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    ::ng-deep .mat-stepper-horizontal {
      background: transparent;
    }

    @media (max-width: 600px) {
      .auth-card {
        padding: 24px;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  personalInfoForm: FormGroup;
  accountInfoForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor() {
    this.personalInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required]
    });

    this.accountInfoForm = this.fb.group({
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.personalInfoForm.valid && this.accountInfoForm.valid) {
      this.isLoading = true;
      
      const registerData = {
        ...this.personalInfoForm.value,
        ...this.accountInfoForm.value,
        dateOfBirth: this.personalInfoForm.value.dateOfBirth.toISOString().split('T')[0]
      };
      delete registerData.confirmPassword;

      this.authService.register(registerData).subscribe({
        next: () => {
          this.toastr.success('Registration successful! Please verify your email with OTP.', 'Success');
          this.router.navigate(['/auth/verify-otp'], { 
            queryParams: { email: registerData.email } 
          });
        },
        error: () => {
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
