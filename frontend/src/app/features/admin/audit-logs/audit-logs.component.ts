import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AdminService } from '../../../services/admin.service';
import { AuditLog } from '../../../models/admin.models';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="audit-logs-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <div>
            <h1>Audit Logs</h1>
            <p>Track all system activities and changes</p>
          </div>
          <button mat-raised-button (click)="loadLogs()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>

        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search logs...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Action Type</mat-label>
              <mat-select [formControl]="actionFilter">
                <mat-option value="">All Actions</mat-option>
                <mat-option value="Create">Create</mat-option>
                <mat-option value="Update">Update</mat-option>
                <mat-option value="Delete">Delete</mat-option>
                <mat-option value="Login">Login</mat-option>
                <mat-option value="Logout">Logout</mat-option>
                <mat-option value="Approve">Approve</mat-option>
                <mat-option value="Reject">Reject</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Entity Type</mat-label>
              <mat-select [formControl]="entityFilter">
                <mat-option value="">All Entities</mat-option>
                <mat-option value="Policy">Policy</mat-option>
                <mat-option value="Claim">Claim</mat-option>
                <mat-option value="User">User</mat-option>
                <mat-option value="Discount">Discount</mat-option>
                <mat-option value="Report">Report</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card>

        <!-- Audit Logs Table -->
        <mat-card class="logs-card">
          <div class="card-header">
            <h2>Activity Log ({{ totalLogs }})</h2>
          </div>

          <div class="table-container" *ngIf="logs.length > 0">
            <table mat-table [dataSource]="logs" class="logs-table">
              <!-- Timestamp Column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                <td mat-cell *matCellDef="let log">
                  <div class="timestamp">
                    <mat-icon>schedule</mat-icon>
                    <div>
                      <div class="date">{{ log.timestamp | date:'short' }}</div>
                      <div class="time-ago">{{ getTimeAgo(log.timestamp) }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- User Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let log">
                  <div class="user-info">
                    <mat-icon>account_circle</mat-icon>
                    <div>
                      <div class="user-name">{{ log.userName || 'System' }}</div>
                      <div class="user-id">{{ log.userId }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let log">
                  <mat-chip [class]="getActionClass(log.action)">
                    {{ log.action }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Entity Column -->
              <ng-container matColumnDef="entity">
                <th mat-header-cell *matHeaderCellDef>Entity</th>
                <td mat-cell *matCellDef="let log">
                  <div class="entity-info">
                    <strong>{{ log.entityType }}</strong>
                    <span class="entity-id">{{ log.entityId }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let log">
                  <div class="description">{{ log.description }}</div>
                </td>
              </ng-container>

              <!-- IP Address Column -->
              <ng-container matColumnDef="ipAddress">
                <th mat-header-cell *matHeaderCellDef>IP Address</th>
                <td mat-cell *matCellDef="let log">
                  <span class="ip-address">{{ log.ipAddress || 'N/A' }}</span>
                </td>
              </ng-container>

              <!-- Details Column -->
              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef>Details</th>
                <td mat-cell *matCellDef="let log">
                  <button mat-icon-button (click)="viewDetails(log)">
                    <mat-icon>info</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <div class="empty-state" *ngIf="logs.length === 0 && !isLoading">
            <mat-icon>history</mat-icon>
            <h3>No Audit Logs</h3>
            <p>No activity logs match your filters</p>
          </div>

          <!-- Pagination -->
          <mat-paginator 
            *ngIf="totalLogs > 0"
            [length]="totalLogs"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </mat-card>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .audit-logs-page {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 30px;
      border-radius: 8px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }

    .page-header p {
      margin: 0;
      color: #666;
    }

    .filters-card {
      padding: 20px;
      margin-bottom: 20px;
    }

    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
    }

    .logs-card {
      padding: 0;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
    }

    .card-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .logs-table {
      width: 100%;
    }

    .timestamp {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .timestamp mat-icon {
      color: #999;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .date {
      font-weight: 500;
      color: #333;
    }

    .time-ago {
      font-size: 11px;
      color: #999;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-info mat-icon {
      color: #667eea;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .user-id {
      font-size: 11px;
      color: #999;
      font-family: monospace;
    }

    mat-chip {
      font-size: 11px;
      min-height: 22px;
      font-weight: 600;
    }

    .create-chip {
      background: #d1fae5;
      color: #065f46;
    }

    .update-chip {
      background: #dbeafe;
      color: #1e40af;
    }

    .delete-chip {
      background: #fee2e2;
      color: #991b1b;
    }

    .login-chip {
      background: #e0e7ff;
      color: #3730a3;
    }

    .approve-chip {
      background: #d1fae5;
      color: #065f46;
    }

    .reject-chip {
      background: #fef3c7;
      color: #92400e;
    }

    .entity-info strong {
      display: block;
      color: #333;
    }

    .entity-id {
      display: block;
      font-size: 11px;
      color: #999;
      font-family: monospace;
    }

    .description {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #666;
    }

    .ip-address {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .empty-state p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .filters {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .page-header button {
        width: 100%;
      }
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  logs: AuditLog[] = [];
  displayedColumns = ['timestamp', 'user', 'action', 'entity', 'description', 'ipAddress', 'details'];
  
  searchControl = new FormControl('');
  actionFilter = new FormControl('');
  entityFilter = new FormControl('');
  
  page = 1;
  pageSize = 10;
  totalLogs = 0;
  isLoading = false;

  ngOnInit(): void {
    this.loadLogs();
    this.setupFilters();
  }

  setupFilters(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadLogs());

    this.actionFilter.valueChanges.subscribe(() => this.loadLogs());
    this.entityFilter.valueChanges.subscribe(() => this.loadLogs());
  }

  loadLogs(): void {
    this.isLoading = true;
    this.adminService.getAuditLogs(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        this.logs = response.items || [];
        this.totalLogs = response.totalCount || 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load audit logs');
        // Use mock data for demo
        this.logs = [];
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  getActionClass(action: string): string {
    const actionMap: { [key: string]: string } = {
      'Create': 'create-chip',
      'Update': 'update-chip',
      'Delete': 'delete-chip',
      'Login': 'login-chip',
      'Logout': 'login-chip',
      'Approve': 'approve-chip',
      'Reject': 'reject-chip'
    };
    return actionMap[action] || 'update-chip';
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  viewDetails(log: AuditLog): void {
    this.toastr.info(`Viewing details for log: ${log.action} on ${log.entityType}`);
  }
}
