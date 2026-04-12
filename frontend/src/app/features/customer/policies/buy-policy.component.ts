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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { InsuranceService } from '../../../services/insurance.service';
import { PolicyService } from '../../../services/policy.service';
import { PaymentService } from '../../../services/payment.service';
import { InsuranceType, InsuranceSubtype, QuoteResponse } from '../../../models/policy.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-buy-policy',
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
    MatProgressSpinnerModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="buy-policy-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Buy Insurance Policy</h1>
        </div>

        <mat-stepper [linear]="true" #stepper>
          <!-- Step 1: Select Insurance Type -->
          <mat-step [stepControl]="typeForm">
            <ng-template matStepLabel>Select Type</ng-template>
            <form [formGroup]="typeForm" class="step-form">
              <h2>Choose Insurance Type</h2>
              
              <div class="types-grid">
                <mat-card 
                  *ngFor="let type of insuranceTypes"
                  class="type-card"
                  [class.selected]="selectedTypeId === type.typeId"
                  (click)="selectType(type)">
                  <div class="type-icon">
                    <mat-icon>{{ getIconForType(type.name) }}</mat-icon>
                  </div>
                  <h3>{{ type.name }}</h3>
                  <p>{{ type.description }}</p>
                  <mat-icon class="check-icon" *ngIf="selectedTypeId === type.typeId">
                    check_circle
                  </mat-icon>
                </mat-card>
              </div>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!typeForm.valid" (click)="loadSubtypes()">
                  Next <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Select Subtype & Duration -->
          <mat-step [stepControl]="policyForm">
            <ng-template matStepLabel>Policy Details</ng-template>
            <form [formGroup]="policyForm" class="step-form">
              <h2>Select Plan & Duration</h2>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Plan</mat-label>
                <mat-select formControlName="subtypeId" (selectionChange)="onSubtypeChange()">
                  <mat-option *ngFor="let subtype of subtypes" [value]="subtype.subtypeId">
                    {{ subtype.name }} - Base Rate: {{ subtype.basePremiumRate }}%
                  </mat-option>
                </mat-select>
                <mat-error>Please select a plan</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Duration</mat-label>
                <mat-select formControlName="duration" (selectionChange)="getQuote()">
                  <mat-option [value]="6">6 Months</mat-option>
                  <mat-option [value]="12">1 Year</mat-option>
                  <mat-option [value]="24">2 Years</mat-option>
                  <mat-option [value]="36">3 Years</mat-option>
                </mat-select>
                <mat-error>Please select duration</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Coupon Code (Optional)</mat-label>
                <input matInput formControlName="couponCode" placeholder="Enter coupon code">
              </mat-form-field>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!policyForm.valid" (click)="getQuote()">
                  Get Quote <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Review Quote -->
          <mat-step>
            <ng-template matStepLabel>Review</ng-template>
            <div class="step-form">
              <h2>Review Your Quote</h2>

              <mat-card class="quote-card" *ngIf="quote">
                <h3>Premium Breakdown</h3>
                <div class="quote-item">
                  <span>Base Premium:</span>
                  <span>₹{{ quote.basePremium }}</span>
                </div>
                <div class="quote-item">
                  <span>GST (18%):</span>
                  <span>₹{{ quote.gst }}</span>
                </div>
                <div class="quote-total">
                  <span>Total Premium:</span>
                  <span>₹{{ quote.totalPremium }}</span>
                </div>
                <div class="quote-item">
                  <span>Coverage (IDV):</span>
                  <span>₹{{ quote.idv }}</span>
                </div>
                <div class="quote-item">
                  <span>Valid From:</span>
                  <span>{{ quote.startDate | date }}</span>
                </div>
                <div class="quote-item">
                  <span>Valid Until:</span>
                  <span>{{ quote.endDate | date }}</span>
                </div>
              </mat-card>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button mat-raised-button color="primary" matStepperNext>
                  Proceed to Payment <mat-icon>payment</mat-icon>
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Step 4: Payment -->
          <mat-step>
            <ng-template matStepLabel>Payment</ng-template>
            <div class="step-form">
              <h2>Complete Payment</h2>

              <mat-card class="payment-card">
                <div class="payment-info">
                  <mat-icon>info</mat-icon>
                  <p>This is a demo payment system. Click below to simulate successful payment.</p>
                </div>

                <div class="payment-summary" *ngIf="quote">
                  <h3>Amount to Pay</h3>
                  <div class="amount">₹{{ quote.totalPremium }}</div>
                </div>

                <button mat-raised-button color="accent" class="payment-button"
                        (click)="processPayment()" [disabled]="isProcessing">
                  <mat-spinner diameter="20" *ngIf="isProcessing"></mat-spinner>
                  <mat-icon *ngIf="!isProcessing">check_circle</mat-icon>
                  {{ isProcessing ? 'Processing...' : 'Complete Demo Payment' }}
                </button>
              </mat-card>

              <div class="step-actions">
                <button mat-button matStepperPrevious [disabled]="isProcessing">
                  <mat-icon>arrow_back</mat-icon> Back
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
    .buy-policy-page {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 1000px;
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

    .types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .type-card {
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      border: 2px solid transparent;
    }

    .type-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .type-card.selected {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .type-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .type-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .type-card h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
    }

    .type-card p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .check-icon {
      position: absolute;
      top: 10px;
      right: 10px;
      color: #667eea;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .quote-card, .payment-card {
      padding: 30px;
      margin-bottom: 20px;
    }

    .quote-card h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
    }

    .quote-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .quote-total {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      font-size: 20px;
      font-weight: 700;
      color: #667eea;
      border-top: 2px solid #667eea;
      margin-top: 12px;
    }

    .payment-info {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .payment-info mat-icon {
      color: #2196f3;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .payment-summary {
      text-align: center;
      margin-bottom: 30px;
    }

    .payment-summary h3 {
      margin: 0 0 12px 0;
      color: #666;
    }

    .amount {
      font-size: 48px;
      font-weight: 700;
      color: #667eea;
    }

    .payment-button {
      width: 100%;
      height: 56px;
      font-size: 18px;
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
      .types-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BuyPolicyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private insuranceService = inject(InsuranceService);
  private policyService = inject(PolicyService);
  private paymentService = inject(PaymentService);
  private toastr = inject(ToastrService);

  typeForm!: FormGroup;
  policyForm!: FormGroup;
  
  insuranceTypes: InsuranceType[] = [];
  subtypes: InsuranceSubtype[] = [];
  selectedTypeId = '';
  quote: QuoteResponse | null = null;
  isProcessing = false;

  ngOnInit(): void {
    this.initForms();
    this.loadInsuranceTypes();
  }

  initForms(): void {
    this.typeForm = this.fb.group({
      typeId: ['', Validators.required]
    });

    this.policyForm = this.fb.group({
      subtypeId: ['', Validators.required],
      duration: [12, Validators.required],
      couponCode: ['']
    });
  }

  loadInsuranceTypes(): void {
  this.insuranceService.getAllTypes().subscribe({
    next: (types) => {
      this.insuranceTypes = types;  // Remove .filter(t => t.isActive)
    },
    error: () => {
      this.toastr.error('Failed to load insurance types');
    }
  });
}

  selectType(type: InsuranceType): void {
    this.selectedTypeId = type.typeId;
    this.typeForm.patchValue({ typeId: type.typeId });
  }

  loadSubtypes(): void {
  if (!this.selectedTypeId) return;
  
  this.insuranceService.getSubtypesByTypeId(this.selectedTypeId).subscribe({
    next: (subtypes) => {
      console.log('Subtypes received:', subtypes);
      this.subtypes = subtypes;  // Remove .filter(s => s.isActive)
      if (this.subtypes.length > 0) {
        this.policyForm.patchValue({ subtypeId: this.subtypes[0].subtypeId });
      }
    },
    error: () => {
      this.toastr.error('Failed to load plans');
    }
  });
}

  onSubtypeChange(): void {
    this.quote = null;
  }

  getQuote(): void {
    if (!this.policyForm.valid) return;

    const data = {
      subtypeId: this.policyForm.value.subtypeId,
      duration: this.policyForm.value.duration,
      couponCode: this.policyForm.value.couponCode || undefined
    };

    this.policyService.getQuote(data).subscribe({
      next: (quote) => {
        this.quote = quote;
      },
      error: () => {
        this.toastr.error('Failed to calculate quote');
      }
    });
  }

  processPayment(): void {
    if (!this.quote) return;

    this.isProcessing = true;

    const policyData = {
      subtypeId: this.policyForm.value.subtypeId,
      duration: this.policyForm.value.duration,
      couponCode: this.policyForm.value.couponCode || undefined
    };

    this.policyService.createPolicy(policyData).subscribe({
      next: (policy) => {
        // Process demo payment
        this.paymentService.processDemoPayment(
          policy.policyId,
          this.quote!.totalPremium
        ).subscribe({
          next: () => {
            this.isProcessing = false;
            this.toastr.success('Policy purchased successfully!');
            setTimeout(() => {
              this.router.navigate(['/customer/policies', policy.policyId]);
            }, 1500);
          },
          error: () => {
            this.isProcessing = false;
            this.toastr.error('Payment failed');
          }
        });
      },
      error: () => {
        this.isProcessing = false;
        this.toastr.error('Failed to create policy');
      }
    });
  }

  getIconForType(typeName: string): string {
    const iconMap: { [key: string]: string } = {
      'Vehicle': 'directions_car',
      'Car': 'directions_car',
      'Home': 'home',
      'Health': 'favorite',
      'Life': 'person',
      'Travel': 'flight'
    };

    for (const key in iconMap) {
      if (typeName.toLowerCase().includes(key.toLowerCase())) {
        return iconMap[key];
      }
    }
    return 'shield';
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}
