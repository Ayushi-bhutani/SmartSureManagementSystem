import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ClaimService } from '../../../services/claim.service';
import { Claim } from '../../../models/claim.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="claim-list-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <h1>My Claims</h1>
          <button mat-raised-button color="primary" (click)="initiateClaim()">
            <mat-icon>add</mat-icon>
            File New Claim
          </button>
        </div>

        <div class="filters-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" 
                   placeholder="Search by claim number or type">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="Draft">Draft</mat-option>
              <mat-option value="Submitted">Submitted</mat-option>
              <mat-option value="Under Review">Under Review</mat-option>
              <mat-option value="Approved">Approved</mat-option>
              <mat-option value="Rejected">Rejected</mat-option>
              <mat-option value="Closed">Closed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="claims-grid" *ngIf="filteredClaims.length > 0">
          <mat-card *ngFor="let claim of filteredClaims" class="claim-card">
            <div class="claim-header">
              <div class="claim-icon">
                <mat-icon>{{ getIconForType(claim.claimType || '') }}</mat-icon>
              </div>
              <div class="claim-info">
                <h3>{{ claim.claimType || 'Claim' }}</h3>
                <p class="claim-number">{{ claim.formattedClaimId || claim.claimId }}</p>
              </div>
              <app-status-badge [status]="claim.status"></app-status-badge>
            </div>

            <div class="claim-details">
              <div class="detail-item">
                <mat-icon>account_balance_wallet</mat-icon>
                <div>
                  <span class="label">Claimed Amount</span>
                  <span class="value">₹{{ claim.claimAmount || 0 }}</span>
                </div>
              </div>

              <div class="detail-item" *ngIf="claim.approvedAmount">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <span class="label">Approved Amount</span>
                  <span class="value approved">₹{{ claim.approvedAmount }}</span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="label">Submitted</span>
                  <span class="value">{{ claim.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>

            <div class="claim-description">
              <p>{{ (claim.description || '') | slice:0:100 }}{{ (claim.description || '').length > 100 ? '...' : '' }}</p>
            </div>

            <div class="claim-actions">
              <button mat-button (click)="viewClaim(claim.claimId)">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
            </div>
          </mat-card>
        </div>

        <div class="empty-state" *ngIf="filteredClaims.length === 0 && !isLoading">
          <mat-icon>assignment</mat-icon>
          <h2>No Claims Found</h2>
          <p *ngIf="searchTerm || statusFilter">Try adjusting your filters</p>
          <p *ngIf="!searchTerm && !statusFilter">You haven't filed any claims yet</p>
          <button mat-raised-button color="primary" (click)="initiateClaim()">
            <mat-icon>add</mat-icon>
            File Your First Claim
          </button>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .claim-list-page {
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
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
    }

    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 30px;
    }

    .search-field {
      flex: 1;
    }

    .filter-field {
      width: 200px;
    }

    .claims-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .claim-card {
      padding: 0;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .claim-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .claim-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .claim-icon {
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .claim-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .claim-info {
      flex: 1;
    }

    .claim-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
    }

    .claim-number {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
      font-family: monospace;
    }

    .claim-details {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-item mat-icon {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .detail-item .label {
      display: block;
      font-size: 12px;
      color: #999;
    }

    .detail-item .value {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .detail-item .value.approved {
      color: #4ade80;
    }

    .claim-description {
      padding: 0 20px 20px;
      color: #666;
      line-height: 1.6;
    }

    .claim-description p {
      margin: 0;
    }

    .claim-actions {
      padding: 16px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 8px;
    }

    .empty-state mat-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-state h2 {
      margin: 0 0 12px 0;
      font-size: 28px;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 30px 0;
      color: #666;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .filters-section {
        flex-direction: column;
      }

      .filter-field {
        width: 100%;
      }

      .claims-grid {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .page-header button {
        width: 100%;
      }
    }
  `]
})
export class ClaimListComponent implements OnInit {
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private toastr = inject(ToastrService);

  claims: Claim[] = [];
  filteredClaims: Claim[] = [];
  searchTerm = '';
  statusFilter = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.isLoading = true;
    this.claimService.getMyClaims(1, 100).subscribe({
      next: (response) => {
        this.claims = response.items || [];
        this.filteredClaims = this.claims;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load claims');
      }
    });
  }

  applyFilters(): void {
    this.filteredClaims = this.claims.filter(claim => {
      const claimNumber = claim.formattedClaimId || claim.claimId || '';
      const claimType = claim.claimType || '';
      const matchesSearch = !this.searchTerm || 
        claimNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        claimType.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || claim.status === this.statusFilter;

      return matchesSearch && matchesStatus;
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

  viewClaim(claimId: string): void {
    this.router.navigate(['/customer/claims', claimId]);
  }

  initiateClaim(): void {
    this.router.navigate(['/customer/initiate-claim']);
  }
}
