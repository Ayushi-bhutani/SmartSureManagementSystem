import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PolicyService } from '../../../services/policy.service';
import { ClaimService } from '../../../services/claim.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Policy } from '../../../models/policy.models';
import { Claim } from '../../../models/claim.models';
import { Payment } from '../../../models/payment.models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>

      <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <h1>Welcome back, {{ userName }}!</h1>
          <p>Manage your insurance policies and claims</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div class="stat-icon" style="background: #e3f2fd;">
              <mat-icon style="color: #1976d2;">description</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalPolicies }}</div>
              <div class="stat-label">Total Policies</div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon" style="background: #e8f5e9;">
              <mat-icon style="color: #388e3c;">check_circle</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.activePolicies }}</div>
              <div class="stat-label">Active Policies</div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon" style="background: #fff3e0;">
              <mat-icon style="color: #f57c00;">assignment</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalClaims }}</div>
              <div class="stat-label">Total Claims</div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon" style="background: #fce4ec;">
              <mat-icon style="color: #c2185b;">pending</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.pendingClaims }}</div>
              <div class="stat-label">Pending Claims</div>
            </div>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <mat-card class="quick-actions-card">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button mat-raised-button color="primary" routerLink="/customer/buy-policy">
              <mat-icon>add_shopping_cart</mat-icon>
              Buy New Policy
            </button>
            <button mat-raised-button color="accent" routerLink="/customer/initiate-claim">
              <mat-icon>assignment_add</mat-icon>
              File a Claim
            </button>
            <button mat-stroked-button routerLink="/customer/policies">
              <mat-icon>description</mat-icon>
              View All Policies
            </button>
            <button mat-stroked-button routerLink="/customer/claims">
              <mat-icon>assignment</mat-icon>
              View All Claims
            </button>
          </div>
        </mat-card>

        <!-- Recent Policies -->
        <mat-card class="content-card">
          <div class="card-header">
            <h2>Recent Policies</h2>
            <button mat-button routerLink="/customer/policies">
              View All
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>

          <div class="table-container" *ngIf="recentPolicies.length > 0">
            <table mat-table [dataSource]="recentPolicies" class="policies-table">
              <ng-container matColumnDef="policyNumber">
                <th mat-header-cell *matHeaderCellDef>Policy Number</th>
                <td mat-cell *matCellDef="let policy">{{ policy.policyNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let policy">
                  {{ policy.insuranceSubtype?.name || 'N/A' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="premium">
                <th mat-header-cell *matHeaderCellDef>Premium</th>
                <td mat-cell *matCellDef="let policy">
                  {{ '$' + (policy.premiumAmount | number:'1.2-2') }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let policy">
                  <app-status-badge [status]="policy.status"></app-status-badge>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let policy">
                  <button mat-icon-button [routerLink]="['/customer/policies', policy.policyId]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="policyColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: policyColumns;"></tr>
            </table>
          </div>

          <div class="empty-state" *ngIf="recentPolicies.length === 0">
            <mat-icon>description</mat-icon>
            <p>No policies yet</p>
            <button mat-raised-button color="primary" routerLink="/customer/buy-policy">
              Buy Your First Policy
            </button>
          </div>
        </mat-card>

        <!-- Recent Claims -->
        <mat-card class="content-card">
          <div class="card-header">
            <h2>Recent Claims</h2>
            <button mat-button routerLink="/customer/claims">
              View All
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>

          <div class="table-container" *ngIf="recentClaims.length > 0">
            <table mat-table [dataSource]="recentClaims" class="claims-table">
              <ng-container matColumnDef="claimNumber">
                <th mat-header-cell *matHeaderCellDef>Claim Number</th>
                <td mat-cell *matCellDef="let claim">{{ claim.claimNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let claim">{{ claim.claimType }}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let claim">
                  {{ '$' + (claim.claimedAmount | number:'1.2-2') }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let claim">
                  <app-status-badge [status]="claim.status"></app-status-badge>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let claim">
                  <button mat-icon-button [routerLink]="['/customer/claims', claim.claimId]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="claimColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: claimColumns;"></tr>
            </table>
          </div>

          <div class="empty-state" *ngIf="recentClaims.length === 0">
            <mat-icon>assignment</mat-icon>
            <p>No claims yet</p>
            <button mat-raised-button color="accent" routerLink="/customer/initiate-claim">
              File Your First Claim
            </button>
          </div>
        </mat-card>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .dashboard-container {
      flex: 1;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      width: 100%;
    }

    .welcome-section {
      margin-bottom: 32px;
    }

    .welcome-section h1 {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }

    .welcome-section p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 24px;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quick-actions-card {
      padding: 24px;
      margin-bottom: 32px;
    }

    .quick-actions-card h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .actions-grid button {
      height: 56px;
      font-size: 16px;
    }

    .content-card {
      padding: 24px;
      margin-bottom: 32px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .table-container {
      overflow-x: auto;
    }

    .policies-table,
    .claims-table {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state p {
      font-size: 16px;
      color: #999;
      margin: 0 0 24px 0;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .welcome-section h1 {
        font-size: 24px;
      }
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  private policyService = inject(PolicyService);
  private claimService = inject(ClaimService);
  private authService = inject(AuthService);

  userName = '';
  stats = {
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0,
    pendingClaims: 0
  };

  recentPolicies: Policy[] = [];
  recentClaims: Claim[] = [];

  policyColumns = ['policyNumber', 'type', 'premium', 'status', 'actions'];
  claimColumns = ['claimNumber', 'type', 'amount', 'status', 'actions'];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.firstName || 'User';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load policies
    this.policyService.getMyPolicies(1, 5).subscribe({
      next: (policies) => {
        this.recentPolicies = policies.slice(0, 5);
        this.stats.totalPolicies = policies.length;
        this.stats.activePolicies = policies.filter((p: Policy) => p.status === 'Active').length;
      }
    });

    // Load claims
    this.claimService.getMyClaims(1, 5).subscribe({
      next: (response) => {
        this.recentClaims = response.items;
        this.stats.totalClaims = response.totalCount;
        this.stats.pendingClaims = response.items.filter(
          c => c.status === 'Submitted' || c.status === 'Under Review'
        ).length;
      }
    });
  }
}
