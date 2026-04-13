import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PolicyService } from '../../../services/policy.service';
import { Policy } from '../../../models/policy.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="policy-detail-page">
      <app-navbar></app-navbar>

      <div class="container" *ngIf="policy">
        <div class="page-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-content">
            <h1>{{ policy.subtypeName || policy.insuranceSubtype?.name || policy.typeName || 'Insurance Policy' }}</h1>
            <p class="policy-number">{{ policy.formattedPolicyId || policy.policyNumber || policy.policyId }}</p>
          </div>
          <app-status-badge [status]="policy.status"></app-status-badge>
        </div>

        <div class="content-grid">
          <!-- Main Info Card -->
          <mat-card class="main-card">
            <div class="policy-icon-large">
              <mat-icon>{{ getIconForType(policy.insuranceSubtype?.name || '') }}</mat-icon>
            </div>
            
            <h2>{{ policy.subtypeName || policy.insuranceSubtype?.name || policy.typeName || 'Insurance Policy' }}</h2>
            
            <div class="key-info">
              <div class="info-item">
                <span class="label">Coverage (IDV)</span>
                <span class="value primary">₹{{ policy.insuredDeclaredValue || policy.idv || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="label">Premium Amount</span>
                <span class="value">₹{{ policy.premiumAmount || 0 }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="dates-info">
              <div class="date-item">
                <mat-icon>event_available</mat-icon>
                <div>
                  <span class="label">Start Date</span>
                  <span class="value">{{ policy.startDate | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="date-item">
                <mat-icon>event_busy</mat-icon>
                <div>
                  <span class="label">End Date</span>
                  <span class="value">{{ policy.endDate | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button mat-raised-button color="primary" 
                      (click)="initiateClaim()"
                      [disabled]="policy.status !== 'Active'">
                <mat-icon>assignment</mat-icon>
                File a Claim
              </button>
              <button mat-stroked-button (click)="downloadPolicy()">
                <mat-icon>download</mat-icon>
                Download Policy
              </button>
            </div>
          </mat-card>

          <!-- Details Tabs -->
          <mat-card class="details-card">
            <mat-tab-group>
              <!-- Insured Details Tab -->
              <mat-tab label="Policy Details">
                <div class="tab-content">
                  <div class="detail-row">
                    <mat-icon>confirmation_number</mat-icon>
                    <div class="detail-info">
                      <span class="label">Policy Number</span>
                      <span class="value">{{ policy.formattedPolicyId || policy.policyNumber || policy.policyId }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>category</mat-icon>
                    <div class="detail-info">
                      <span class="label">Insurance Type</span>
                      <span class="value">{{ policy.subtypeName || policy.insuranceSubtype?.name || policy.typeName }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>shield</mat-icon>
                    <div class="detail-info">
                      <span class="label">Coverage (IDV)</span>
                      <span class="value">₹{{ policy.insuredDeclaredValue || policy.idv || 0 }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>payments</mat-icon>
                    <div class="detail-info">
                      <span class="label">Premium Amount</span>
                      <span class="value">₹{{ policy.premiumAmount }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>info</mat-icon>
                    <div class="detail-info">
                      <span class="label">Status</span>
                      <span class="value">
                        <app-status-badge [status]="policy.status"></app-status-badge>
                      </span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>schedule</mat-icon>
                    <div class="detail-info">
                      <span class="label">Policy Start Date</span>
                      <span class="value">{{ policy.startDate | date:'medium' }}</span>
                    </div>
                  </div>

                  <div class="detail-row" *ngIf="policy.approvedClaimsCount !== undefined">
                    <mat-icon>assignment</mat-icon>
                    <div class="detail-info">
                      <span class="label">Approved Claims</span>
                      <span class="value">{{ policy.approvedClaimsCount || 0 }}</span>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- Coverage Details Tab -->
              <mat-tab label="Coverage Details">
                <div class="tab-content">
                  <div class="coverage-info">
                    <h3>What's Covered</h3>
                    <ul class="coverage-list">
                      <li>
                        <mat-icon>check_circle</mat-icon>
                        <span>Full coverage up to ₹{{ policy.insuredDeclaredValue || policy.idv || 0 }}</span>
                      </li>
                      <li>
                        <mat-icon>check_circle</mat-icon>
                        <span>24/7 Emergency Support</span>
                      </li>
                      <li>
                        <mat-icon>check_circle</mat-icon>
                        <span>Fast Claim Processing</span>
                      </li>
                      <li>
                        <mat-icon>check_circle</mat-icon>
                        <span>No Hidden Charges</span>
                      </li>
                    </ul>

                    <h3>Important Notes</h3>
                    <div class="note-box">
                      <mat-icon>info</mat-icon>
                      <p>
                        This policy is valid from {{ policy.startDate | date:'mediumDate' }} 
                        to {{ policy.endDate | date:'mediumDate' }}. 
                        Please ensure timely premium payments to keep your policy active.
                      </p>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </div>
      </div>

      <div class="container" *ngIf="!policy && !isLoading">
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <h2>Policy Not Found</h2>
          <p>The policy you're looking for doesn't exist or you don't have access to it.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Go Back
          </button>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .policy-detail-page {
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

    .policy-number {
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

    .policy-icon-large {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .policy-icon-large mat-icon {
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
      display: flex;
      flex-direction: column;
      gap: 12px;
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

    .coverage-info h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }

    .coverage-list {
      list-style: none;
      padding: 0;
      margin: 0 0 32px 0;
    }

    .coverage-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }

    .coverage-list mat-icon {
      color: #4ade80;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .note-box {
      display: flex;
      gap: 12px;
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
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
export class PolicyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private policyService = inject(PolicyService);
  private toastr = inject(ToastrService);

  policy: Policy | null = null;
  isLoading = false;

  ngOnInit(): void {
    const policyId = this.route.snapshot.paramMap.get('id');
    if (policyId) {
      this.loadPolicy(policyId);
    }
  }

  loadPolicy(policyId: string): void {
    this.isLoading = true;
    this.policyService.getPolicyById(policyId).subscribe({
      next: (policy) => {
        console.log('=== POLICY DATA FROM BACKEND ===');
        console.log('Full policy object:', policy);
        console.log('Policy ID:', policy.policyId);
        console.log('Formatted Policy ID:', policy.formattedPolicyId);
        console.log('Policy Number:', policy.policyNumber);
        console.log('Subtype Name:', policy.subtypeName);
        console.log('Type Name:', policy.typeName);
        console.log('IDV:', policy.insuredDeclaredValue);
        console.log('Start Date:', policy.startDate);
        console.log('Created At:', policy.createdAt);
        console.log('================================');
        this.policy = policy;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load policy details');
      }
    });
  }

  getIconForType(typeName: string): string {
    const iconMap: { [key: string]: string } = {
      'Vehicle': 'directions_car',
      'Car': 'directions_car',
      'Auto': 'directions_car',
      'Home': 'home',
      'House': 'home',
      'Property': 'apartment',
      'Health': 'favorite',
      'Medical': 'local_hospital',
      'Life': 'person',
      'Travel': 'flight',
      'Business': 'business'
    };

    for (const key in iconMap) {
      if (typeName.toLowerCase().includes(key.toLowerCase())) {
        return iconMap[key];
      }
    }
    return 'shield';
  }

  initiateClaim(): void {
    if (this.policy) {
      this.router.navigate(['/customer/initiate-claim'], {
        queryParams: { policyId: this.policy.policyId }
      });
    }
  }

  downloadPolicy(): void {
    if (!this.policy) return;

    // Create a simple HTML-based policy document
    const policyHtml = this.generatePolicyHtml();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(policyHtml);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        printWindow.print();
      };
      
      this.toastr.success('Policy document opened. Use Print to save as PDF.', 'Download');
    } else {
      this.toastr.error('Please allow popups to download the policy');
    }
  }

  private generatePolicyHtml(): string {
    if (!this.policy) return '';

    const idv = this.policy.insuredDeclaredValue || this.policy.idv || 0;
    const typeName = this.policy.subtypeName || this.policy.insuranceSubtype?.name || this.policy.typeName || 'Insurance Policy';
    const policyNumber = this.policy.formattedPolicyId || this.policy.policyNumber || this.policy.policyId;
    const issueDate = this.policy.createdAt || this.policy.startDate;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Policy Document - ${policyNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      background: white;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #667eea;
      font-size: 32px;
      margin-bottom: 5px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .policy-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .policy-title h2 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    .policy-title p {
      font-size: 14px;
      opacity: 0.9;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h3 {
      color: #667eea;
      font-size: 18px;
      margin-bottom: 15px;
      border-bottom: 2px solid #eee;
      padding-bottom: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      padding: 10px;
      background: #f9f9f9;
      border-left: 3px solid #667eea;
    }
    .info-item label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item value {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .highlight-box {
      background: #f0f4ff;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .highlight-box h4 {
      color: #667eea;
      margin-bottom: 10px;
    }
    .coverage-list {
      list-style: none;
      padding: 0;
    }
    .coverage-list li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .coverage-list li:before {
      content: "✓ ";
      color: #4ade80;
      font-weight: bold;
      margin-right: 8px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: #4ade80;
      color: white;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SmartSure Insurance</h1>
    <p>Your Trusted Insurance Management Partner</p>
  </div>

  <div class="policy-title">
    <h2>${typeName}</h2>
    <p>Policy Number: ${policyNumber}</p>
    <p>Status: <span class="status-badge">${this.policy.status}</span></p>
  </div>

  <div class="section">
    <h3>Policy Information</h3>
    <div class="info-grid">
      <div class="info-item">
        <label>Policy Number</label>
        <value>${policyNumber}</value>
      </div>
      <div class="info-item">
        <label>Insurance Type</label>
        <value>${typeName}</value>
      </div>
      <div class="info-item">
        <label>Start Date</label>
        <value>${new Date(this.policy.startDate).toLocaleDateString('en-IN', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })}</value>
      </div>
      <div class="info-item">
        <label>End Date</label>
        <value>${new Date(this.policy.endDate).toLocaleDateString('en-IN', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })}</value>
      </div>
      <div class="info-item">
        <label>Status</label>
        <value>${this.policy.status}</value>
      </div>
      <div class="info-item">
        <label>Issue Date</label>
        <value>${new Date(issueDate).toLocaleDateString('en-IN', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })}</value>
      </div>
    </div>
  </div>

  <div class="highlight-box">
    <h4>Coverage & Premium Details</h4>
    <div class="info-grid">
      <div class="info-item">
        <label>Insured Declared Value (IDV)</label>
        <value>₹${idv.toLocaleString('en-IN')}</value>
      </div>
      <div class="info-item">
        <label>Premium Amount</label>
        <value>₹${this.policy.premiumAmount.toLocaleString('en-IN')}</value>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>Coverage Benefits</h3>
    <ul class="coverage-list">
      <li>Full coverage up to ₹${idv.toLocaleString('en-IN')}</li>
      <li>24/7 Emergency Support</li>
      <li>Fast Claim Processing</li>
      <li>No Hidden Charges</li>
      <li>Cashless Settlement at Network Garages/Hospitals</li>
      <li>Personal Accident Cover</li>
    </ul>
  </div>

  <div class="section">
    <h3>Important Terms & Conditions</h3>
    <ul class="coverage-list">
      <li>Policy is valid from ${new Date(this.policy.startDate).toLocaleDateString('en-IN')} to ${new Date(this.policy.endDate).toLocaleDateString('en-IN')}</li>
      <li>Premium must be paid in full for policy to remain active</li>
      <li>Claims must be filed within 24 hours of incident</li>
      <li>All claims are subject to verification and approval</li>
      <li>Policy can be renewed 30 days before expiry</li>
      <li>Cancellation requests must be submitted in writing</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>SmartSure Insurance Management System</strong></p>
    <p>Email: support@smartsure.com | Phone: 1-800-SMARTSURE</p>
    <p>This is a computer-generated document and does not require a signature.</p>
    <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
  </div>
</body>
</html>
    `;
  }

  goBack(): void {
    this.router.navigate(['/customer/policies']);
  }
}
