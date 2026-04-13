import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PolicyService } from '../../../../services/policy.service';
import { Policy } from '../../../../models/policy.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-policy-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    NavbarComponent,
    FooterComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="admin-policy-list-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <h1>Policy Management</h1>
        </div>

        <mat-card>
          <div class="table-container" *ngIf="policies.length > 0">
            <table mat-table [dataSource]="policies" class="policies-table">
              <ng-container matColumnDef="policyNumber">
                <th mat-header-cell *matHeaderCellDef>Policy Number</th>
                <td mat-cell *matCellDef="let policy">{{ policy.formattedPolicyId || policy.policyId }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let policy">{{ policy.subtypeName || policy.typeName }}</td>
              </ng-container>

              <ng-container matColumnDef="premium">
                <th mat-header-cell *matHeaderCellDef>Premium</th>
                <td mat-cell *matCellDef="let policy">₹{{ policy.premiumAmount }}</td>
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
                  <button mat-icon-button (click)="viewPolicy(policy.policyId)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <div class="empty-state" *ngIf="policies.length === 0">
            <mat-icon>policy</mat-icon>
            <p>No policies found</p>
          </div>
        </mat-card>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .admin-policy-list-page {
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

    mat-card {
      padding: 24px;
    }

    .table-container {
      overflow-x: auto;
    }

    .policies-table {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
    }
  `]
})
export class AdminPolicyListComponent implements OnInit {
  private router = inject(Router);
  private policyService = inject(PolicyService);
  private toastr = inject(ToastrService);

  policies: Policy[] = [];
  displayedColumns = ['policyNumber', 'type', 'premium', 'status', 'actions'];

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.policyService.getAllPolicies(1, 100).subscribe({
      next: (response) => {
        this.policies = response.items || [];
      },
      error: () => {
        this.toastr.error('Failed to load policies');
      }
    });
  }

  viewPolicy(policyId: string): void {
    this.router.navigate(['/customer/policies', policyId]);
  }
}
