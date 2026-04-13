import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PolicyService } from '../../../services/policy.service';
import { ClaimService } from '../../../services/claim.service';
import { Policy } from '../../../models/policy.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-initiate-claim',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="initiate-claim-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>File a Claim</h1>
        </div>

        <mat-stepper [linear]="true" #stepper>
          <!-- Step 1: Select Policy -->
          <mat-step [stepControl]="policyForm">
            <ng-template matStepLabel>Select Policy</ng-template>
            <form [formGroup]="policyForm" class="step-form">
              <h2>Choose Policy for Claim</h2>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Active Policy</mat-label>
                <mat-select formControlName="policyId" (selectionChange)="onPolicySelect()">
                  <mat-option *ngFor="let policy of activePolicies" [value]="policy.policyId">
                    {{ policy.formattedPolicyId || policy.policyId }} - 
                    {{ policy.subtypeName || policy.typeName }} 
                    (Coverage: ₹{{ policy.insuredDeclaredValue || 0 }})
                  </mat-option>
                </mat-select>
                <mat-error>Please select a policy</mat-error>
              </mat-form-field>

              <mat-card *ngIf="selectedPolicy" class="policy-info-card">
                <h3>Policy Details</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Policy Number</span>
                    <span class="value">{{ selectedPolicy.formattedPolicyId || selectedPolicy.policyId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Type</span>
                    <span class="value">{{ selectedPolicy.subtypeName || selectedPolicy.typeName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Coverage</span>
                    <span class="value">₹{{ selectedPolicy.insuredDeclaredValue || 0 }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Premium</span>
                    <span class="value">₹{{ selectedPolicy.premiumAmount }}</span>
                  </div>
                </div>
              </mat-card>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext [disabled]="!policyForm.valid">
                  Next <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Claim Details -->
          <mat-step [stepControl]="claimForm">
            <ng-template matStepLabel>Claim Details</ng-template>
            <form [formGroup]="claimForm" class="step-form">
              <h2>Provide Claim Information</h2>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Claim Type</mat-label>
                <mat-select formControlName="claimType">
                  <mat-option value="Accident">Accident</mat-option>
                  <mat-option value="Theft">Theft</mat-option>
                  <mat-option value="Fire">Fire</mat-option>
                  <mat-option value="Natural Disaster">Natural Disaster</mat-option>
                  <mat-option value="Vandalism">Vandalism</mat-option>
                  <mat-option value="Other">Other</mat-option>
                </mat-select>
                <mat-error>Please select claim type</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Incident Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="incidentDate" 
                       [max]="maxDate" placeholder="Select date">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error>Please select incident date</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Claimed Amount</mat-label>
                <input matInput type="number" formControlName="claimedAmount" 
                       placeholder="Enter amount" min="1">
                <span matTextPrefix>₹&nbsp;</span>
                <mat-error *ngIf="claimForm.get('claimedAmount')?.hasError('required')">
                  Amount is required
                </mat-error>
                <mat-error *ngIf="claimForm.get('claimedAmount')?.hasError('min')">
                  Amount must be positive
                </mat-error>
                <mat-error *ngIf="claimForm.get('claimedAmount')?.hasError('max')">
                  Amount cannot exceed coverage (₹{{ selectedPolicy?.insuredDeclaredValue || 0 }})
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Incident Description</mat-label>
                <textarea matInput formControlName="incidentDescription" 
                          rows="5" placeholder="Describe what happened in detail"></textarea>
                <mat-hint>Minimum 20 characters</mat-hint>
                <mat-error>Please provide a detailed description (min 20 characters)</mat-error>
              </mat-form-field>

              <mat-checkbox formControlName="isCompletelyDamaged" class="full-width">
                Total Loss / Complete Damage
              </mat-checkbox>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="!claimForm.valid">
                  Review <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Review & Submit -->
          <mat-step>
            <ng-template matStepLabel>Review & Submit</ng-template>
            <div class="step-form">
              <h2>Review Your Claim</h2>

              <mat-card class="review-card">
                <h3>Policy Information</h3>
                <div class="review-item">
                  <span class="label">Policy Number:</span>
                  <span class="value">{{ selectedPolicy?.formattedPolicyId || selectedPolicy?.policyId }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Policy Type:</span>
                  <span class="value">{{ selectedPolicy?.subtypeName || selectedPolicy?.typeName }}</span>
                </div>
              </mat-card>

              <mat-card class="review-card">
                <h3>Claim Details</h3>
                <div class="review-item">
                  <span class="label">Claim Type:</span>
                  <span class="value">{{ claimForm.value.claimType }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Incident Date:</span>
                  <span class="value">{{ claimForm.value.incidentDate | date:'mediumDate' }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Claimed Amount:</span>
                  <span class="value amount">₹{{ claimForm.value.claimedAmount }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Total Loss:</span>
                  <span class="value">{{ claimForm.value.isCompletelyDamaged ? 'Yes' : 'No' }}</span>
                </div>
                <div class="review-item full-width">
                  <span class="label">Description:</span>
                  <p class="description">{{ claimForm.value.incidentDescription }}</p>
                </div>
              </mat-card>

              <div class="info-box">
                <mat-icon>info</mat-icon>
                <div>
                  <p><strong>What happens next?</strong></p>
                  <ul>
                    <li>Your claim will be submitted for review</li>
                    <li>Our team will review within 2-3 business days</li>
                    <li>You'll be notified via email about the status</li>
                    <li>You can upload supporting documents after submission</li>
                  </ul>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious [disabled]="isSubmitting">
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button mat-raised-button color="accent" (click)="submitClaim()" [disabled]="isSubmitting">
                  <mat-icon>send</mat-icon>
                  {{ isSubmitting ? 'Submitting...' : 'Submit Claim' }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .initiate-claim-page {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 900px;
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

    mat-stepper {
      background: white;
      border-radius: 8px;
      padding: 20px;
    }

    .step-form {
      padding: 30px 20px;
    }

    .step-form h2 {
      margin: 0 0 30px 0;
      font-size: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .policy-info-card, .review-card {
      padding: 20px;
      margin-bottom: 20px;
    }

    .policy-info-card h3, .review-card h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #667eea;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
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

    .review-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .review-item:last-child {
      border-bottom: none;
    }

    .review-item.full-width {
      flex-direction: column;
      gap: 8px;
    }

    .review-item .label {
      color: #666;
      font-weight: 500;
    }

    .review-item .value {
      color: #333;
      font-weight: 600;
    }

    .review-item .value.amount {
      color: #667eea;
      font-size: 20px;
    }

    .review-item .description {
      margin: 0;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 4px;
      line-height: 1.6;
    }

    .info-box {
      display: flex;
      gap: 12px;
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .info-box mat-icon {
      color: #2196f3;
      font-size: 32px;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .info-box p {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .info-box ul {
      margin: 0;
      padding-left: 20px;
      color: #1976d2;
    }

    .info-box li {
      margin: 4px 0;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InitiateClaimComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private policyService = inject(PolicyService);
  private claimService = inject(ClaimService);
  private toastr = inject(ToastrService);

  policyForm!: FormGroup;
  claimForm!: FormGroup;
  
  activePolicies: Policy[] = [];
  selectedPolicy: Policy | null = null;
  isSubmitting = false;
  maxDate = new Date();

  ngOnInit(): void {
    this.initForms();
    this.loadActivePolicies();
    
    // Check if policyId is passed as query param
    const policyId = this.route.snapshot.queryParamMap.get('policyId');
    if (policyId) {
      this.policyForm.patchValue({ policyId });
    }
  }

  initForms(): void {
    this.policyForm = this.fb.group({
      policyId: ['', Validators.required]
    });

    this.claimForm = this.fb.group({
      claimType: ['', Validators.required],
      incidentDate: ['', Validators.required],
      claimedAmount: ['', [Validators.required, Validators.min(1)]],
      incidentDescription: ['', [Validators.required, Validators.minLength(20)]],
      isCompletelyDamaged: [false]
    });
  }

  loadActivePolicies(): void {
    this.policyService.getMyPolicies(1, 100).subscribe({
      next: (policies) => {
        this.activePolicies = policies.filter(p => p.status === 'Active');
        
        // If policyId was passed, select it
        const policyId = this.route.snapshot.queryParamMap.get('policyId');
        if (policyId) {
          this.selectedPolicy = this.activePolicies.find(p => p.policyId === policyId) || null;
          if (this.selectedPolicy) {
            this.updateClaimAmountValidator();
          }
        }
      },
      error: () => {
        this.toastr.error('Failed to load policies');
      }
    });
  }

  onPolicySelect(): void {
    const policyId = this.policyForm.value.policyId;
    this.selectedPolicy = this.activePolicies.find(p => p.policyId === policyId) || null;
    this.updateClaimAmountValidator();
  }

  updateClaimAmountValidator(): void {
    if (this.selectedPolicy) {
      const maxAmount = this.selectedPolicy.insuredDeclaredValue || 0;
      this.claimForm.get('claimedAmount')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(maxAmount)
      ]);
      this.claimForm.get('claimedAmount')?.updateValueAndValidity();
    }
  }

  submitClaim(): void {
    if (!this.policyForm.valid || !this.claimForm.valid) return;

    this.isSubmitting = true;

    const claimData = {
      policyId: this.policyForm.value.policyId,
      claimType: this.claimForm.value.claimType,
      description: this.claimForm.value.incidentDescription, // Backend expects 'description'
      claimAmount: this.claimForm.value.claimedAmount, // Backend expects 'claimAmount'
      isCompletelyDamaged: this.claimForm.value.isCompletelyDamaged
    };

    // Step 1: Create the claim (status will be Draft)
    this.claimService.createClaim(claimData).subscribe({
      next: (claim) => {
        // Step 2: Submit the claim to change status to Submitted
        this.claimService.submitClaim(claim.claimId).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toastr.success('Claim submitted successfully!', 'Success');
            this.router.navigate(['/customer/claims', claim.claimId]);
          },
          error: () => {
            this.isSubmitting = false;
            this.toastr.warning('Claim created but submission failed. You can submit it later from claim details.', 'Warning');
            this.router.navigate(['/customer/claims', claim.claimId]);
          }
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.toastr.error('Failed to create claim. Please try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}
