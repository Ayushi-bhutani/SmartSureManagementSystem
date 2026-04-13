import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AdminService } from '../../../services/admin.service';
import { ClaimService } from '../../../services/claim.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="admin-dashboard-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <h1>Admin Dashboard</h1>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div class="stat-icon policies">
              <mat-icon>policy</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalPolicies }}</h3>
              <p>Total Policies</p>
              <span class="stat-change positive">+{{ stats.activePolicies }} active</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon claims">
              <mat-icon>assignment</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats.pendingClaims }}</h3>
              <p>Pending Claims</p>
              <span class="stat-change warning">Needs review</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon users">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalUsers }}</h3>
              <p>Total Users</p>
              <span class="stat-change">Registered</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon revenue">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-content">
              <h3>₹{{ stats.totalRevenue | number:'1.0-0' }}</h3>
              <p>Total Revenue</p>
              <span class="stat-change positive">This month</span>
            </div>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button mat-raised-button color="primary" (click)="navigate('/admin/claims')">
              <mat-icon>assignment</mat-icon>
              Review Claims
            </button>
            <button mat-raised-button (click)="navigate('/admin/policies')">
              <mat-icon>policy</mat-icon>
              Manage Policies
            </button>
            <button mat-raised-button (click)="navigate('/admin/users')">
              <mat-icon>people</mat-icon>
              Manage Users
            </button>
            <button mat-raised-button (click)="navigate('/admin/reports')">
              <mat-icon>assessment</mat-icon>
              View Reports
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-section">
          <mat-card>
            <h2>Recent Claims</h2>
            <div class="table-container" *ngIf="recentClaims.length > 0">
              <table mat-table [dataSource]="recentClaims" class="activity-table">
                <ng-container matColumnDef="claimId">
                  <th mat-header-cell *matHeaderCellDef>Claim ID</th>
                  <td mat-cell *matCellDef="let claim">{{ claim.formattedClaimId || claim.claimId }}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let claim">{{ claim.claimType }}</td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let claim">₹{{ claim.claimAmount }}</td>
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
                    <button mat-icon-button (click)="reviewClaim(claim.claimId)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="claimColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: claimColumns;"></tr>
              </table>
            </div>
            <div class="empty-state" *ngIf="recentClaims.length === 0">
              <p>No recent claims</p>
            </div>
          </mat-card>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .admin-dashboard-page {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-icon.policies {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-icon.claims {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-icon.users {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-icon.revenue {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      margin: 0 0 4px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .stat-content p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .stat-change {
      font-size: 12px;
      color: #999;
    }

    .stat-change.positive {
      color: #4ade80;
    }

    .stat-change.warning {
      color: #fb923c;
    }

    .quick-actions {
      margin-bottom: 30px;
    }

    .quick-actions h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .actions-grid button {
      height: 60px;
      font-size: 16px;
    }

    .recent-section mat-card {
      padding: 24px;
    }

    .recent-section h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .activity-table {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private claimService = inject(ClaimService);
  private toastr = inject(ToastrService);

  stats = {
    totalPolicies: 0,
    activePolicies: 0,
    pendingClaims: 0,
    totalUsers: 0,
    totalRevenue: 0
  };

  recentClaims: any[] = [];
  claimColumns = ['claimId', 'type', 'amount', 'status', 'actions'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = {
          totalPolicies: stats.totalPolicies,
          activePolicies: stats.activePolicies,
          pendingClaims: stats.pendingClaims,
          totalUsers: stats.totalUsers,
          totalRevenue: stats.totalRevenue
        };
      },
      error: () => {
        // Use mock data if API fails
        this.stats = {
          totalPolicies: 0,
          activePolicies: 0,
          pendingClaims: 0,
          totalUsers: 0,
          totalRevenue: 0
        };
      }
    });

    // Load recent claims
    this.claimService.getAllClaims(1, 5).subscribe({
      next: (response: any) => {
        this.recentClaims = response.items || [];
      },
      error: () => {
        this.recentClaims = [];
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  reviewClaim(claimId: string): void {
    this.router.navigate(['/admin/claims', claimId, 'review']);
  }
}
