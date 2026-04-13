import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ClaimService } from '../../../../services/claim.service';
import { Claim } from '../../../../models/claim.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-claim-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTabsModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="claim-review-page">
      <app-navbar></app-navbar>

      <div class="container" *ngIf="claim">
        <div class="page-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-content">
            <h1>Review Claim</h1>
            <p class="claim-number">{{ claim.formattedClaimId || claim.claimId }}</p>
          </div>
          <app-status-badge [status]="claim.status"></app-status-badge>
        </div>

        <div class="content-grid">
          <!-- Claim Details Card -->
          <mat-card class="details-card">
            <h2>Claim Information</h2>
            
            <div class="detail-row">
              <span class="label">Claim Type:</span>
              <span class="value">{{ claim.claimType }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Policy ID:</span>
              <span class="value">{{ claim.formattedPolicyId || claim.policyId }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Claimed Amount:</span>
              <span class="value amount">₹{{ claim.claimAmount }}</span>
            </div>

            <div class="detail-row" *ngIf="claim.isCompletelyDamaged">
              <span class="label">Total Loss:</span>
              <span class="value warning">Yes</span>
            </div>

            <div class="detail-row">
              <span class="label">Submitted On:</span>
              <span class="value">{{ claim.createdAt | date:'medium' }}</span>
            </div>

            <mat-divider></mat-divider>

            <h3>Description</h3>
            <p class="description">{{ claim.description }}</p>

            <div class="documents-section" *ngIf="claim.documents && claim.documents.length > 0">
              <h3>Supporting Documents</h3>
              <div class="document-list">
                <div class="document-item" *ngFor="let doc of claim.documents">
                  <mat-icon>insert_drive_file</mat-icon>
                  <span>{{ doc.fileName }}</span>
                  <button mat-icon-button (click)="viewDocument(doc.fileUrl)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Review Actions Card -->
          <mat-card class="actions-card" *ngIf="claim.status === 'Submitted' || claim.status === 'Under Review'">
            <h2>Review Decision</h2>

            <mat-tab-group>
              <!-- Approve Tab -->
              <mat-tab label="Approve">
                <div class="tab-content">
                  <form [formGroup]="approveForm">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Approved Amount</mat-label>
                      <input matInput type="number" formControlName="approvedAmount" 
                             placeholder="Enter approved amount" min="1" [max]="claim.claimAmount">
                      <span matTextPrefix>₹&nbsp;</span>
                      <mat-hint>Maximum: ₹{{ claim.claimAmount }}</mat-hint>
                      <mat-error>Please enter a valid amount</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Review Notes</mat-label>
                      <textarea matInput formControlName="notes" rows="4" 
                                placeholder="Add notes about your decision"></textarea>
                    </mat-form-field>

                    <button mat-raised-button color="primary" class="full-width"
                            (click)="approveClaim()" [disabled]="!approveForm.valid || isProcessing">
                      <mat-icon>check_circle</mat-icon>
                      {{ isProcessing ? 'Processing...' : 'Approve Claim' }}
                    </button>
                  </form>
                </div>
              </mat-tab>

              <!-- Reject Tab -->
              <mat-tab label="Reject">
                <div class="tab-content">
                  <form [formGroup]="rejectForm">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Rejection Reason</mat-label>
                      <textarea matInput formControlName="reason" rows="6" 
                                placeholder="Provide detailed reason for rejection"></textarea>
                      <mat-error>Rejection reason is required</mat-error>
                    </mat-form-field>

                    <button mat-raised-button color="warn" class="full-width"
                            (click)="rejectClaim()" [disabled]="!rejectForm.valid || isProcessing">
                      <mat-icon>cancel</mat-icon>
                      {{ isProcessing ? 'Processing...' : 'Reject Claim' }}
                    </button>
                  </form>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>

          <!-- Already Reviewed Card -->
          <mat-card class="actions-card" *ngIf="claim.status === 'Approved' || claim.status === 'Rejected'">
            <h2>Review Completed</h2>
            
            <div class="review-result" [class.approved]="claim.status === 'Approved'" 
                 [class.rejected]="claim.status === 'Rejected'">
              <mat-icon>{{ claim.status === 'Approved' ? 'check_circle' : 'cancel' }}</mat-icon>
              <h3>Claim {{ claim.status }}</h3>
            </div>

            <div class="detail-row" *ngIf="claim.approvedAmount">
              <span class="label">Approved Amount:</span>
              <span class="value">₹{{ claim.approvedAmount }}</span>
            </div>

            <div class="detail-row" *ngIf="claim.reviewNotes">
              <span class="label">Review Notes:</span>
              <p class="value">{{ claim.reviewNotes }}</p>
            </div>

            <div class="detail-row" *ngIf="claim.rejectionReason">
              <span class="label">Rejection Reason:</span>
              <p class="value">{{ claim.rejectionReason }}</p>
            </div>

            <div class="detail-row" *ngIf="claim.reviewedAt">
              <span class="label">Reviewed On:</span>
              <span class="value">{{ claim.reviewedAt | date:'medium' }}</span>
            </div>
          </mat-card>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .claim-review-page {
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

    .header-content {
      flex: 1;
    }

    .header-content h1 {
      margin: 0 0 4px 0;
      font-size: 28px;
    }

    .claim-number {
      margin: 0;
      font-size: 14px;
      color: #999;
      font-family: monospace;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
    }

    .details-card, .actions-card {
      padding: 24px;
    }

    .details-card h2, .actions-card h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
    }

    .details-card h3 {
      margin: 20px 0 12px 0;
      font-size: 16px;
      color: #667eea;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row .label {
      color: #666;
      font-weight: 500;
    }

    .detail-row .value {
      color: #333;
      font-weight: 600;
      text-align: right;
    }

    .detail-row .value.amount {
      color: #667eea;
      font-size: 20px;
    }

    .detail-row .value.warning {
      color: #fb923c;
    }

    .description {
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      line-height: 1.6;
      color: #333;
    }

    .documents-section {
      margin-top: 20px;
    }

    .document-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .document-item mat-icon {
      color: #667eea;
    }

    .document-item span {
      flex: 1;
    }

    .tab-content {
      padding: 24px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .review-result {
      text-align: center;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .review-result.approved {
      background: #f0fdf4;
      border: 2px solid #4ade80;
    }

    .review-result.rejected {
      background: #fef2f2;
      border: 2px solid #f87171;
    }

    .review-result mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 12px;
    }

    .review-result.approved mat-icon {
      color: #4ade80;
    }

    .review-result.rejected mat-icon {
      color: #f87171;
    }

    .review-result h3 {
      margin: 0;
      font-size: 24px;
    }

    @media (max-width: 968px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClaimReviewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private toastr = inject(ToastrService);

  claim: Claim | null = null;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  isProcessing = false;

  ngOnInit(): void {
    this.initForms();
    const claimId = this.route.snapshot.paramMap.get('id');
    if (claimId) {
      this.loadClaim(claimId);
    }
  }

  initForms(): void {
    this.approveForm = this.fb.group({
      approvedAmount: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });

    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadClaim(claimId: string): void {
    this.claimService.getClaimById(claimId).subscribe({
      next: (claim) => {
        this.claim = claim;
        // Pre-fill approved amount with claimed amount
        this.approveForm.patchValue({
          approvedAmount: claim.claimAmount
        });
        // Set max validator
        this.approveForm.get('approvedAmount')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(claim.claimAmount)
        ]);
      },
      error: () => {
        this.toastr.error('Failed to load claim details');
        this.goBack();
      }
    });
  }

  approveClaim(): void {
    if (!this.approveForm.valid || !this.claim) return;

    this.isProcessing = true;
    const data = {
      approvedAmount: this.approveForm.value.approvedAmount,
      notes: this.approveForm.value.notes || ''
    };

    this.claimService.approveClaim(this.claim.claimId, data).subscribe({
      next: () => {
        this.isProcessing = false;
        this.toastr.success('Claim approved successfully!');
        this.loadClaim(this.claim!.claimId);
      },
      error: () => {
        this.isProcessing = false;
        this.toastr.error('Failed to approve claim');
      }
    });
  }

  rejectClaim(): void {
    if (!this.rejectForm.valid || !this.claim) return;

    this.isProcessing = true;
    const data = {
      reason: this.rejectForm.value.reason
    };

    this.claimService.rejectClaim(this.claim.claimId, data).subscribe({
      next: () => {
        this.isProcessing = false;
        this.toastr.success('Claim rejected');
        this.loadClaim(this.claim!.claimId);
      },
      error: () => {
        this.isProcessing = false;
        this.toastr.error('Failed to reject claim');
      }
    });
  }

  viewDocument(url: string): void {
    window.open(url, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/admin/claims']);
  }
}
