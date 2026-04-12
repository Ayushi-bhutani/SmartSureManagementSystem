import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-header">
            <mat-icon class="auth-icon">verified_user</mat-icon>
            <h1>Verify Your Email</h1>
            <p>Enter the OTP sent to {{ email }}</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="otpForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>OTP Code</mat-label>
              <input matInput formControlName="otp" placeholder="Enter 6-digit OTP" 
                     maxlength="6" autocomplete="off">
              <mat-icon matPrefix>pin</mat-icon>
              <mat-error *ngIf="otpForm.get('otp')?.hasError('required')">
                OTP is required
              </mat-error>
              <mat-error *ngIf="otpForm.get('otp')?.hasError('pattern')">
                OTP must be 6 digits
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    class="full-width submit-btn" [disabled]="otpForm.invalid || isLoading">
              <span *ngIf="!isLoading">Verify OTP</span>
              <span *ngIf="isLoading">Verifying...</span>
            </button>
          </form>

          <div class="back-link">
            <a routerLink="/auth/login">Back to Login</a>
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
      max-width: 450px;
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
      color: #4caf50;
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

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .submit-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 24px;
    }

    .back-link {
      text-align: center;
    }

    .back-link a {
      color: #3f51b5;
      text-decoration: none;
      font-size: 14px;
    }

    .back-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class VerifyOtpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  otpForm: FormGroup;
  email: string = '';
  isLoading = false;

  constructor() {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.router.navigate(['/auth/register']);
      }
    });
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.isLoading = true;
      const data = {
        email: this.email,
        otp: this.otpForm.value.otp
      };

      this.authService.verifyOtp(data).subscribe({
        next: () => {
          this.toastr.success('Email verified successfully!', 'Success');
          this.router.navigate(['/auth/login']);
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
