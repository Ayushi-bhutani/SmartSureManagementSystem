import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PolicyService } from '../../../services/policy.service';
import { Policy } from '../../../models/policy.models';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="policy-list-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <div class="header-content">
            <h1>My Policies</h1>
            <p>Manage and view all your insurance policies</p>
          </div>
          <button mat-raised-button color="primary" (click)="buyNewPolicy()">
            <mat-icon>add</mat-icon>
            Buy New Policy
          </button>
        </div>

        <mat-card class="filters-card">
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
                     placeholder="Search by policy number or type">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
                <mat-option value="">All</mat-option>
                <mat-option value="Active">Active</mat-option>
                <mat-option value="Pending">Pending</mat-option>
                <mat-option value="Expired">Expired</mat-option>
                <mat-option value="Cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card>

        <div class="policies-grid" *ngIf="filteredPolicies.length > 0">
          <mat-card class="policy-card" *ngFor="let policy of filteredPolicies">
            <div class="policy-header">
              <div class="policy-icon">
                <mat-icon>{{ getIconForType(policy.insuranceSubtype?.name || '') }}</mat-icon>
              </div>
              <div class="policy-info">
                <h3>{{ policy.insuranceSubtype?.name || 'Insurance Policy' }}</h3>
                <p class="policy-number">{{ policy.policyNumber }}</p>
              </div>
              <app-status-badge [status]="policy.status"></app-status-badge>
            </div>

            <div class="policy-details">
              <div class="detail-item">
                <mat-icon>account_balance_wallet</mat-icon>
                <div>
                  <span class="label">Coverage (IDV)</span>
                  <span class="value">₹{{ policy.idv }}</span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>payments</mat-icon>
                <div>
                  <span class="label">Premium</span>
                  <span class="value">₹{{ policy.premiumAmount }}</span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="label">Valid Until</span>
                  <span class="value">{{ policy.endDate | date }}</span>
                </div>
              </div>
            </div>

            <div class="policy-actions">
              <button mat-button (click)="viewPolicy(policy.policyId)">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
              <button mat-button color="primary" (click)="initiateClaim(policy.policyId)"
                      [disabled]="policy.status !== 'Active'">
                <mat-icon>assignment</mat-icon>
                File Claim
              </button>
            </div>
          </mat-card>
        </div>

        <div class="empty-state" *ngIf="filteredPolicies.length === 0 && !isLoading">
          <mat-icon>description</mat-icon>
          <h2>No Policies Found</h2>
          <p>{{ searchTerm || statusFilter ? 'Try adjusting your filters' : 'Start by purchasing your first insurance policy' }}</p>
          <button mat-raised-button color="primary" (click)="buyNewPolicy()">
            <mat-icon>add</mat-icon>
            Buy Your First Policy
          </button>
        </div>

        <div class="loading-state" *ngIf="isLoading">
          <p>Loading policies...</p>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .policy-list-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      flex: 1;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      color: #333;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .filters-card {
      margin-bottom: 30px;
      padding: 20px;
    }

    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    .policies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .policy-card {
      padding: 24px;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .policy-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .policy-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    }

    .policy-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .policy-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .policy-info {
      flex: 1;
    }

    .policy-info h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      color: #333;
    }

    .policy-number {
      margin: 0;
      font-size: 14px;
      color: #999;
      font-family: monospace;
    }

    .policy-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-item mat-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .detail-item > div {
      display: flex;
      flex-direction: column;
    }

    .detail-item .label {
      font-size: 12px;
      color: #999;
    }

    .detail-item .value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .policy-actions {
      display: flex;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .policy-actions button {
      flex: 1;
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

    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .policies-grid {
        grid-template-columns: 1fr;
      }

      .policy-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PolicyListComponent implements OnInit {
  private policyService = inject(PolicyService);
  private router = inject(Router);

  policies: Policy[] = [];
  filteredPolicies: Policy[] = [];
  searchTerm = '';
  statusFilter = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.isLoading = true;
    this.policyService.getMyPolicies().subscribe({
      next: (policies) => {
        this.policies = policies;
        this.filteredPolicies = policies;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredPolicies = this.policies.filter(policy => {
      const typeName = policy.insuranceSubtype?.name || '';
      const matchesSearch = !this.searchTerm || 
        policy.policyNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        typeName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || policy.status === this.statusFilter;

      return matchesSearch && matchesStatus;
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

  viewPolicy(policyId: string): void {
    this.router.navigate(['/customer/policies', policyId]);
  }

  initiateClaim(policyId: string): void {
    this.router.navigate(['/customer/initiate-claim'], {
      queryParams: { policyId }
    });
  }

  buyNewPolicy(): void {
    this.router.navigate(['/customer/buy-policy']);
  }
}
