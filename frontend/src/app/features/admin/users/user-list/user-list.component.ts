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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { AdminService } from '../../../../services/admin.service';
import { AdminUser } from '../../../../models/admin.models';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
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
    MatDialogModule,
    MatMenuModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="user-list-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <h1>User Management</h1>
          <p>Manage system users and their roles</p>
        </div>

        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search Users</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name or email">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Filter by Role</mat-label>
              <mat-select [formControl]="roleFilter">
                <mat-option value="">All Roles</mat-option>
                <mat-option value="Customer">Customer</mat-option>
                <mat-option value="Admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="loadUsers()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
        </mat-card>

        <!-- Users Table -->
        <mat-card class="table-card">
          <div class="table-header">
            <h2>All Users ({{ totalUsers }})</h2>
          </div>

          <div class="table-container" *ngIf="users.length > 0">
            <table mat-table [dataSource]="users" class="users-table">
              <!-- User ID Column -->
              <ng-container matColumnDef="userId">
                <th mat-header-cell *matHeaderCellDef>User ID</th>
                <td mat-cell *matCellDef="let user">
                  <span class="user-id">{{ user.formattedUserId || user.userId }}</span>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-info">
                    <mat-icon class="user-avatar">account_circle</mat-icon>
                    <div>
                      <div class="user-name">{{ user.fullName }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let user">{{ user.phoneNumber || 'N/A' }}</td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [class.customer-chip]="user.role === 'Customer'" 
                            [class.admin-chip]="user.role === 'Admin'">
                    {{ user.role }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Stats Column -->
              <ng-container matColumnDef="stats">
                <th mat-header-cell *matHeaderCellDef>Activity</th>
                <td mat-cell *matCellDef="let user">
                  <div class="stats">
                    <span class="stat-item">
                      <mat-icon>policy</mat-icon>
                      {{ user.policiesCount || 0 }}
                    </span>
                    <span class="stat-item">
                      <mat-icon>assignment</mat-icon>
                      {{ user.claimsCount || 0 }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Joined Date Column -->
              <ng-container matColumnDef="joinedDate">
                <th mat-header-cell *matHeaderCellDef>Joined</th>
                <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'mediumDate' }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewUser(user)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    <button mat-menu-item (click)="changeRole(user)">
                      <mat-icon>swap_horiz</mat-icon>
                      Change Role
                    </button>
                    <button mat-menu-item (click)="deleteUser(user)" class="danger">
                      <mat-icon>delete</mat-icon>
                      Delete User
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <div class="empty-state" *ngIf="users.length === 0 && !isLoading">
            <mat-icon>people_outline</mat-icon>
            <h3>No Users Found</h3>
            <p>No users match your search criteria</p>
          </div>

          <!-- Pagination -->
          <mat-paginator 
            *ngIf="totalUsers > 0"
            [length]="totalUsers"
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
    .user-list-page {
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
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .filters mat-form-field {
      flex: 1;
    }

    .table-card {
      padding: 0;
    }

    .table-header {
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
    }

    .table-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .user-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .user-email {
      font-size: 12px;
      color: #999;
    }

    mat-chip {
      font-size: 12px;
      min-height: 24px;
    }

    .customer-chip {
      background: #e3f2fd;
      color: #1976d2;
    }

    .admin-chip {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .stats {
      display: flex;
      gap: 12px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #666;
    }

    .stat-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
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

    .danger {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
      }

      .filters mat-form-field,
      .filters button {
        width: 100%;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  users: AdminUser[] = [];
  displayedColumns = ['userId', 'name', 'phone', 'role', 'stats', 'joinedDate', 'actions'];
  
  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  
  page = 1;
  pageSize = 10;
  totalUsers = 0;
  isLoading = false;

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilters();
  }

  setupFilters(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadUsers());

    this.roleFilter.valueChanges.subscribe(() => this.loadUsers());
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        this.users = response.items || [];
        this.totalUsers = response.totalCount || 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load users');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  viewUser(user: AdminUser): void {
    this.toastr.info(`Viewing details for ${user.fullName}`);
  }

  changeRole(user: AdminUser): void {
    const newRole = user.role === 'Customer' ? 'Admin' : 'Customer';
    if (confirm(`Change ${user.fullName}'s role to ${newRole}?`)) {
      this.adminService.updateUserRole(user.userId, newRole).subscribe({
        next: () => {
          this.toastr.success('User role updated successfully');
          this.loadUsers();
        },
        error: () => {
          this.toastr.error('Failed to update user role');
        }
      });
    }
  }

  deleteUser(user: AdminUser): void {
    if (confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      this.adminService.deleteUser(user.userId).subscribe({
        next: () => {
          this.toastr.success('User deleted successfully');
          this.loadUsers();
        },
        error: () => {
          this.toastr.error('Failed to delete user');
        }
      });
    }
  }
}
