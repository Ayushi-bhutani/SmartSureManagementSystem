import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ClaimService } from '../../../services/claim.service';
import { Claim, ClaimHistory } from '../../../models/claim.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="claim-detail-page">
      <app-navbar></app-navbar>

      <div class="container" *ngIf="claim">
        <div class="page-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-content">
            <h1>{{ claim.claimType || 'Claim Details' }}</h1>
            <p class="claim-number">{{ claim.formattedClaimId || claim.claimId }}</p>
          </div>
          <app-status-badge [status]="claim.status"></app-status-badge>
        </div>

        <div class="content-grid">
          <!-- Main Info Card -->
          <mat-card class="main-card">
            <div class="claim-icon-large">
              <mat-icon>{{ getIconForType(claim.claimType || '') }}</mat-icon>
            </div>
            
            <h2>{{ claim.claimType || 'Claim' }}</h2>
            
            <div class="key-info">
              <div class="info-item">
                <span class="label">Claimed Amount</span>
                <span class="value primary">₹{{ claim.claimAmount || 0 }}</span>
              </div>
              <div class="info-item" *ngIf="claim.approvedAmount">
                <span class="label">Approved Amount</span>
                <span class="value approved">₹{{ claim.approvedAmount }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="dates-info">
              <div class="date-item">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="label">Submitted On</span>
                  <span class="value">{{ claim.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="date-item" *ngIf="claim.reviewedAt">
                <mat-icon>rate_review</mat-icon>
                <div>
                  <span class="label">Reviewed On</span>
                  <span class="value">{{ claim.reviewedAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>

            <mat-chip-set *ngIf="claim.isCompletelyDamaged">
              <mat-chip color="warn" highlighted>
                <mat-icon>warning</mat-icon>
                Total Loss
              </mat-chip>
            </mat-chip-set>

            <div class="action-buttons" *ngIf="claim.status === 'Draft'">
              <button mat-raised-button color="primary" (click)="submitClaimForReview()" [disabled]="isSubmitting">
                <mat-icon>send</mat-icon>
                {{ isSubmitting ? 'Submitting...' : 'Submit for Review' }}
              </button>
            </div>
          </mat-card>

          <!-- Details Tabs -->
          <mat-card class="details-card">
            <mat-tab-group>
              <!-- Claim Details Tab -->
              <mat-tab label="Claim Details">
                <div class="tab-content">
                  <div class="detail-row">
                    <mat-icon>confirmation_number</mat-icon>
                    <div class="detail-info">
                      <span class="label">Claim Number</span>
                      <span class="value">{{ claim.formattedClaimId || claim.claimId }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>policy</mat-icon>
                    <div class="detail-info">
                      <span class="label">Policy Number</span>
                      <span class="value">{{ claim.formattedPolicyId || claim.policyId }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>category</mat-icon>
                    <div class="detail-info">
                      <span class="label">Claim Type</span>
                      <span class="value">{{ claim.claimType }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>account_balance_wallet</mat-icon>
                    <div class="detail-info">
                      <span class="label">Claimed Amount</span>
                      <span class="value">₹{{ claim.claimAmount }}</span>
                    </div>
                  </div>

                  <div class="detail-row" *ngIf="claim.approvedAmount">
                    <mat-icon>check_circle</mat-icon>
                    <div class="detail-info">
                      <span class="label">Approved Amount</span>
                      <span class="value">₹{{ claim.approvedAmount }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>info</mat-icon>
                    <div class="detail-info">
                      <span class="label">Status</span>
                      <span class="value">
                        <app-status-badge [status]="claim.status"></app-status-badge>
                      </span>
                    </div>
                  </div>

                  <div class="detail-row full-width">
                    <mat-icon>description</mat-icon>
                    <div class="detail-info">
                      <span class="label">Incident Description</span>
                      <p class="description">{{ claim.description }}</p>
                    </div>
                  </div>

                  <div class="detail-row full-width" *ngIf="claim.reviewNotes">
                    <mat-icon>rate_review</mat-icon>
                    <div class="detail-info">
                      <span class="label">Review Notes</span>
                      <p class="description">{{ claim.reviewNotes }}</p>
                    </div>
                  </div>

                  <div class="detail-row full-width" *ngIf="claim.rejectionReason">
                    <mat-icon>cancel</mat-icon>
                    <div class="detail-info">
                      <span class="label">Rejection Reason</span>
                      <p class="description rejection">{{ claim.rejectionReason }}</p>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- Documents Tab -->
              <mat-tab label="Documents">
                <div class="tab-content">
                  <div class="documents-section">
                    <h3>Supporting Documents</h3>
                    
                    <div class="documents-list" *ngIf="claim.documents && claim.documents.length > 0">
                      <div class="document-item" *ngFor="let doc of claim.documents">
                        <mat-icon>insert_drive_file</mat-icon>
                        <div class="doc-info">
                          <span class="doc-name">{{ doc.fileName }}</span>
                          <span class="doc-meta">{{ formatFileSize(doc.fileSize) }} • {{ doc.uploadedAt | date:'short' }}</span>
                        </div>
                        <button mat-icon-button (click)="viewDocument(doc.fileUrl)">
                          <mat-icon>visibility</mat-icon>
                        </button>
                      </div>
                    </div>

                    <div class="empty-docs" *ngIf="!claim.documents || claim.documents.length === 0">
                      <mat-icon>folder_open</mat-icon>
                      <p>No documents uploaded yet</p>
                    </div>

                    <div class="note-box">
                      <mat-icon>info</mat-icon>
                      <p>
                        Upload supporting documents like photos, police reports, or medical bills 
                        to help process your claim faster.
                      </p>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- History Tab -->
              <mat-tab label="History">
                <div class="tab-content">
                  <div class="history-section">
                    <h3>Claim Status History</h3>
                    
                    <div class="timeline" *ngIf="claimHistory.length > 0">
                      <div class="timeline-item" *ngFor="let history of claimHistory">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                          <div class="timeline-header">
                            <span class="status">{{ history.newStatus || history.status }}</span>
                            <span class="date">{{ history.changedAt | date:'medium' }}</span>
                          </div>
                          <p class="notes" *ngIf="history.notes">{{ history.notes }}</p>
                          <span class="changed-by">by {{ history.changedBy }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="empty-history" *ngIf="claimHistory.length === 0">
                      <mat-icon>history</mat-icon>
                      <p>No history available</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </div>
      </div>

      <div class="container" *ngIf="!claim && !isLoading">
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <h2>Claim Not Found</h2>
          <p>The claim you're looking for doesn't exist or you don't have access to it.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Go Back
          </button>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .claim-detail-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      flex: 1;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      flex: 1;
    }

    .header-content h1 {
      margin: 0 0 4px 0;
      font-size: 28px;
      color: #333;
    }

    .claim-number {
      margin: 0;
      font-size: 14px;
      color: #999;
      font-family: monospace;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 24px;
    }

    .main-card {
      padding: 32px;
      text-align: center;
      height: fit-content;
    }

    .claim-icon-large {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .claim-icon-large mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: white;
    }

    .main-card h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      color: #333;
    }

    .key-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item .label {
      font-size: 14px;
      color: #999;
    }

    .info-item .value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .info-item .value.primary {
      color: #667eea;
    }

    .info-item .value.approved {
      color: #4ade80;
    }

    mat-divider {
      margin: 24px 0;
    }

    .dates-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
    }

    .date-item mat-icon {
      color: #667eea;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .date-item .label {
      display: block;
      font-size: 12px;
      color: #999;
    }

    .date-item .value {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .action-buttons {
      margin-top: 20px;
    }

    .action-buttons button {
      width: 100%;
    }

    .details-card {
      padding: 0;
    }

    .tab-content {
      padding: 24px;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row.full-width {
      flex-direction: column;
    }

    .detail-row mat-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 4px;
    }

    .detail-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-info .label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-info .value {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .detail-info .description {
      margin: 8px 0 0 0;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 4px;
      line-height: 1.6;
      color: #333;
    }

    .detail-info .description.rejection {
      background: #fee;
      color: #c33;
    }

    .documents-section h3,
    .history-section h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
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

    .doc-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .doc-name {
      font-weight: 500;
      color: #333;
    }

    .doc-meta {
      font-size: 12px;
      color: #999;
    }

    .empty-docs,
    .empty-history {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .empty-docs mat-icon,
    .empty-history mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 12px;
    }

    .note-box {
      display: flex;
      gap: 12px;
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
    }

    .note-box mat-icon {
      color: #2196f3;
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .note-box p {
      margin: 0;
      color: #1976d2;
      line-height: 1.6;
    }

    .timeline {
      position: relative;
      padding-left: 40px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ddd;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 24px;
    }

    .timeline-marker {
      position: absolute;
      left: -29px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #667eea;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #667eea;
    }

    .timeline-content {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .timeline-header .status {
      font-weight: 600;
      color: #667eea;
    }

    .timeline-header .date {
      font-size: 12px;
      color: #999;
    }

    .timeline-content .notes {
      margin: 0 0 8px 0;
      color: #666;
      line-height: 1.6;
    }

    .timeline-content .changed-by {
      font-size: 12px;
      color: #999;
      font-style: italic;
    }

    .error-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 8px;
    }

    .error-state mat-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #f44336;
      margin-bottom: 20px;
    }

    .error-state h2 {
      margin: 0 0 12px 0;
      font-size: 28px;
      color: #333;
    }

    .error-state p {
      margin: 0 0 30px 0;
      color: #666;
      font-size: 16px;
    }

    @media (max-width: 968px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClaimDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private toastr = inject(ToastrService);

  claim: Claim | null = null;
  claimHistory: ClaimHistory[] = [];
  isLoading = false;
  isSubmitting = false;

  ngOnInit(): void {
    const claimId = this.route.snapshot.paramMap.get('id');
    if (claimId) {
      this.loadClaim(claimId);
      this.loadClaimHistory(claimId);
    }
  }

  loadClaim(claimId: string): void {
    this.isLoading = true;
    this.claimService.getClaimById(claimId).subscribe({
      next: (claim) => {
        this.claim = claim;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load claim details');
      }
    });
  }

  loadClaimHistory(claimId: string): void {
    this.claimService.getClaimHistory(claimId).subscribe({
      next: (history) => {
        this.claimHistory = history;
      },
      error: () => {
        // Silent fail for history
      }
    });
  }

  submitClaimForReview(): void {
    if (!this.claim) return;

    this.isSubmitting = true;
    this.claimService.submitClaim(this.claim.claimId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success('Claim submitted for review successfully!');
        // Reload claim to get updated status
        this.loadClaim(this.claim!.claimId);
        this.loadClaimHistory(this.claim!.claimId);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastr.error('Failed to submit claim. Please try again.');
      }
    });
  }

  getIconForType(claimType: string): string {
    const iconMap: { [key: string]: string } = {
      'Accident': 'car_crash',
      'Theft': 'security',
      'Fire': 'local_fire_department',
      'Natural Disaster': 'storm',
      'Vandalism': 'warning',
      'Other': 'assignment'
    };

    return iconMap[claimType] || 'assignment';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  viewDocument(url: string): void {
    window.open(url, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/customer/claims']);
  }
}
