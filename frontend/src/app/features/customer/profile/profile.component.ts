import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatDividerModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="profile-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>My Profile</h1>
        </div>

        <div class="profile-grid">
          <!-- Profile Summary Card -->
          <mat-card class="summary-card">
            <div class="avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <h2>{{ user?.fullName || user?.email }}</h2>
            <p class="email">{{ user?.email }}</p>
            <p class="role">{{ user?.role }}</p>
            
            <mat-divider></mat-divider>
            
            <div class="stats">
              <div class="stat-item">
                <span class="stat-value">{{ stats.totalPolicies }}</span>
                <span class="stat-label">Policies</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.activePolicies }}</span>
                <span class="stat-label">Active</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.totalClaims }}</span>
                <span class="stat-label">Claims</span>
              </div>
            </div>
          </mat-card>

          <!-- Profile Details Card -->
          <mat-card class="details-card">
            <mat-tab-group>
              <!-- Personal Info Tab -->
              <mat-tab label="Personal Information">
                <div class="tab-content">
                  <form [formGroup]="profileForm">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Full Name</mat-label>
                      <input matInput formControlName="fullName" placeholder="Enter your full name">
                      <mat-icon matPrefix>person</mat-icon>
                      <mat-error>Full name is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email" placeholder="your@email.com" readonly>
                      <mat-icon matPrefix>email</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phone" placeholder="+91 1234567890">
                      <mat-icon matPrefix>phone</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Address</mat-label>
                      <textarea matInput formControlName="address" rows="3" placeholder="Enter your address"></textarea>
                      <mat-icon matPrefix>home</mat-icon>
                    </mat-form-field>

                    <div class="form-actions">
                      <button mat-raised-button color="primary" (click)="updateProfile()" 
                              [disabled]="!profileForm.valid || isUpdating">
                        <mat-icon>save</mat-icon>
                        {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                      </button>
                    </div>
                  </form>
                </div>
              </mat-tab>

              <!-- Security Tab -->
              <mat-tab label="Security">
                <div class="tab-content">
                  <form [formGroup]="passwordForm">
                    <h3>Change Password</h3>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Current Password</mat-label>
                      <input matInput formControlName="currentPassword" 
                             [type]="hideCurrentPassword ? 'password' : 'text'">
                      <mat-icon matPrefix>lock</mat-icon>
                      <button mat-icon-button matSuffix type="button"
                              (click)="hideCurrentPassword = !hideCurrentPassword">
                        <mat-icon>{{ hideCurrentPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
                      </button>
                      <mat-error>Current password is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>New Password</mat-label>
                      <input matInput formControlName="newPassword" 
                             [type]="hideNewPassword ? 'password' : 'text'">
                      <mat-icon matPrefix>lock_outline</mat-icon>
                      <button mat-icon-button matSuffix type="button"
                              (click)="hideNewPassword = !hideNewPassword">
                        <mat-icon>{{ hideNewPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                        New password is required
                      </mat-error>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                        Password must be at least 6 characters
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Confirm New Password</mat-label>
                      <input matInput formControlName="confirmPassword" 
                             [type]="hideConfirmPassword ? 'password' : 'text'">
                      <mat-icon matPrefix>lock_outline</mat-icon>
                      <button mat-icon-button matSuffix type="button"
                              (click)="hideConfirmPassword = !hideConfirmPassword">
                        <mat-icon>{{ hideConfirmPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                        Please confirm your password
                      </mat-error>
                      <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                        Passwords do not match
                      </mat-error>
                    </mat-form-field>

                    <div class="form-actions">
                      <button mat-raised-button color="primary" (click)="changePassword()" 
                              [disabled]="!passwordForm.valid || isChangingPassword">
                        <mat-icon>vpn_key</mat-icon>
                        {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                      </button>
                    </div>
                  </form>

                  <mat-divider style="margin: 30px 0;"></mat-divider>

                  <div class="danger-zone">
                    <h3>Danger Zone</h3>
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                    <button mat-stroked-button color="warn" (click)="deleteAccount()">
                      <mat-icon>delete_forever</mat-icon>
                      Delete Account
                    </button>
                  </div>
                </div>
              </mat-tab>

              <!-- Preferences Tab -->
              <mat-tab label="Preferences">
                <div class="tab-content">
                  <h3>Notification Preferences</h3>
                  <p class="info-text">
                    <mat-icon>info</mat-icon>
                    Notification preferences will be available in a future update.
                  </p>

                  <mat-divider style="margin: 30px 0;"></mat-divider>

                  <h3>Account Information</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">User ID</span>
                      <span class="value">{{ user?.userId }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Role</span>
                      <span class="value">{{ user?.role }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Member Since</span>
                      <span class="value">{{ user?.createdAt | date:'mediumDate' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Last Updated</span>
                      <span class="value">{{ user?.updatedAt | date:'mediumDate' }}</span>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 24px;
    }

    .summary-card {
      padding: 32px;
      text-align: center;
      height: fit-content;
    }

    .avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: white;
    }

    .summary-card h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }

    .summary-card .email {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 14px;
    }

    .summary-card .role {
      margin: 0 0 20px 0;
      color: #667eea;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 20px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }

    .details-card {
      padding: 0;
    }

    .tab-content {
      padding: 30px;
    }

    .tab-content h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }

    .danger-zone {
      padding: 20px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
    }

    .danger-zone h3 {
      margin: 0 0 8px 0;
      color: #c33;
    }

    .danger-zone p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .info-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .info-text mat-icon {
      color: #2196f3;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .info-item .label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }

    .info-item .value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    @media (max-width: 968px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  user: any = null;
  stats = {
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0
  };

  isUpdating = false;
  isChangingPassword = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUserProfile(): void {
    // Get user from storage
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.profileForm.patchValue({
        fullName: this.user.fullName || this.user.email,
        email: this.user.email,
        phone: this.user.phone || '',
        address: this.user.address || ''
      });

      // Load stats (mock data for now)
      this.stats = {
        totalPolicies: 0,
        activePolicies: 0,
        totalClaims: 0
      };
    }
  }

  updateProfile(): void {
    if (!this.profileForm.valid) return;

    this.isUpdating = true;

    // Mock update - in real app, call API
    setTimeout(() => {
      this.isUpdating = false;
      this.toastr.success('Profile updated successfully!');
    }, 1000);
  }

  changePassword(): void {
    if (!this.passwordForm.valid) return;

    this.isChangingPassword = true;

    // Mock password change - in real app, call API
    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordForm.reset();
      this.toastr.success('Password changed successfully!');
    }, 1000);
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.toastr.info('Account deletion is not available in demo mode');
    }
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}
