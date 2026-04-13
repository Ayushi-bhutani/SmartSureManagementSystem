import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { InsuranceService } from '../../../../services/insurance.service';
import { InsuranceType, InsuranceSubtype } from '../../../../models/policy.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-insurance-management',
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
    MatSlideToggleModule,
    MatDialogModule,
    MatTabsModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="insurance-management-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <h1>Insurance Types Management</h1>
          <p>Manage insurance types and their plans</p>
        </div>

        <mat-tab-group>
          <!-- Insurance Types Tab -->
          <mat-tab label="Insurance Types">
            <div class="tab-content">
              <mat-card class="types-card">
                <div class="card-header">
                  <h2>Insurance Types</h2>
                  <button mat-raised-button color="primary" (click)="openAddTypeDialog()">
                    <mat-icon>add</mat-icon>
                    Add Type
                  </button>
                </div>

                <div class="types-grid">
                  <mat-card *ngFor="let type of insuranceTypes" class="type-item">
                    <div class="type-header">
                      <div class="type-icon">
                        <mat-icon>{{ getIconForType(type.name) }}</mat-icon>
                      </div>
                      <mat-slide-toggle 
                        [checked]="type.isActive"
                        (change)="toggleTypeStatus(type)"
                        color="primary">
                      </mat-slide-toggle>
                    </div>
                    
                    <h3>{{ type.name }}</h3>
                    <p>{{ type.description }}</p>
                    
                    <div class="type-stats">
                      <span class="stat">
                        <mat-icon>category</mat-icon>
                        {{ getSubtypeCount(type.typeId) }} Plans
                      </span>
                      <span class="stat" [class.active]="type.isActive" [class.inactive]="!type.isActive">
                        {{ type.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>

                    <div class="type-actions">
                      <button mat-button (click)="viewSubtypes(type)">
                        <mat-icon>visibility</mat-icon>
                        View Plans
                      </button>
                      <button mat-button (click)="editType(type)">
                        <mat-icon>edit</mat-icon>
                        Edit
                      </button>
                    </div>
                  </mat-card>
                </div>

                <div class="empty-state" *ngIf="insuranceTypes.length === 0">
                  <mat-icon>category</mat-icon>
                  <h3>No Insurance Types</h3>
                  <p>Add your first insurance type to get started</p>
                </div>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Plans/Subtypes Tab -->
          <mat-tab label="Plans">
            <div class="tab-content">
              <mat-card class="plans-card">
                <div class="card-header">
                  <h2>Insurance Plans</h2>
                  <button mat-raised-button color="primary" (click)="openAddSubtypeDialog()">
                    <mat-icon>add</mat-icon>
                    Add Plan
                  </button>
                </div>

                <div class="table-container" *ngIf="allSubtypes.length > 0">
                  <table mat-table [dataSource]="allSubtypes" class="plans-table">
                    <!-- Plan Name Column -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Plan Name</th>
                      <td mat-cell *matCellDef="let subtype">
                        <div class="plan-info">
                          <strong>{{ subtype.name }}</strong>
                          <span class="plan-desc">{{ subtype.description }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Type Column -->
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Insurance Type</th>
                      <td mat-cell *matCellDef="let subtype">
                        {{ getTypeName(subtype.typeId) }}
                      </td>
                    </ng-container>

                    <!-- Premium Rate Column -->
                    <ng-container matColumnDef="rate">
                      <th mat-header-cell *matHeaderCellDef>Base Rate</th>
                      <td mat-cell *matCellDef="let subtype">
                        <span class="rate">{{ subtype.basePremiumRate }}%</span>
                      </td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let subtype">
                        <mat-slide-toggle 
                          [checked]="subtype.isActive"
                          (change)="toggleSubtypeStatus(subtype)"
                          color="primary">
                          {{ subtype.isActive ? 'Active' : 'Inactive' }}
                        </mat-slide-toggle>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let subtype">
                        <button mat-icon-button (click)="editSubtype(subtype)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button (click)="deleteSubtype(subtype)" class="danger">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="subtypeColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: subtypeColumns;"></tr>
                  </table>
                </div>

                <div class="empty-state" *ngIf="allSubtypes.length === 0">
                  <mat-icon>list</mat-icon>
                  <h3>No Plans Available</h3>
                  <p>Add insurance plans for your types</p>
                </div>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .insurance-management-page {
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

    .tab-content {
      padding: 20px 0;
    }

    .types-card, .plans-card {
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .card-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .type-item {
      padding: 24px;
    }

    .type-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .type-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .type-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .type-item h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .type-item p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .type-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
      margin-bottom: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #666;
    }

    .stat mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .stat.active {
      color: #4ade80;
      font-weight: 600;
    }

    .stat.inactive {
      color: #f87171;
      font-weight: 600;
    }

    .type-actions {
      display: flex;
      gap: 8px;
    }

    .type-actions button {
      flex: 1;
    }

    .table-container {
      overflow-x: auto;
    }

    .plans-table {
      width: 100%;
    }

    .plan-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .plan-desc {
      font-size: 12px;
      color: #999;
    }

    .rate {
      font-weight: 600;
      color: #667eea;
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
      .types-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InsuranceManagementComponent implements OnInit {
  private insuranceService = inject(InsuranceService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  insuranceTypes: InsuranceType[] = [];
  allSubtypes: InsuranceSubtype[] = [];
  subtypeColumns = ['name', 'type', 'rate', 'status', 'actions'];

  ngOnInit(): void {
    this.loadInsuranceTypes();
    this.loadAllSubtypes();
  }

  loadInsuranceTypes(): void {
    this.insuranceService.getAllTypes().subscribe({
      next: (types) => {
        this.insuranceTypes = types;
      },
      error: () => {
        this.toastr.error('Failed to load insurance types');
      }
    });
  }

  loadAllSubtypes(): void {
    // Load subtypes for all types
    this.insuranceService.getAllTypes().subscribe({
      next: (types) => {
        types.forEach(type => {
          this.insuranceService.getSubtypesByTypeId(type.typeId).subscribe({
            next: (subtypes) => {
              this.allSubtypes = [...this.allSubtypes, ...subtypes];
            }
          });
        });
      }
    });
  }

  getSubtypeCount(typeId: string): number {
    return this.allSubtypes.filter(s => s.typeId === typeId).length;
  }

  getTypeName(typeId: string): string {
    const type = this.insuranceTypes.find(t => t.typeId === typeId);
    return type ? type.name : 'Unknown';
  }

  getIconForType(typeName: string): string {
    const iconMap: { [key: string]: string } = {
      'Vehicle': 'directions_car',
      'Car': 'directions_car',
      'Home': 'home',
      'Health': 'favorite',
      'Life': 'person',
      'Travel': 'flight'
    };

    for (const key in iconMap) {
      if (typeName.toLowerCase().includes(key.toLowerCase())) {
        return iconMap[key];
      }
    }
    return 'shield';
  }

  toggleTypeStatus(type: InsuranceType): void {
    this.toastr.info(`Toggling status for ${type.name}`);
    // API call would go here
  }

  toggleSubtypeStatus(subtype: InsuranceSubtype): void {
    this.toastr.info(`Toggling status for ${subtype.name}`);
    // API call would go here
  }

  openAddTypeDialog(): void {
    this.toastr.info('Add Type dialog - Feature coming soon');
  }

  openAddSubtypeDialog(): void {
    this.toastr.info('Add Plan dialog - Feature coming soon');
  }

  viewSubtypes(type: InsuranceType): void {
    this.toastr.info(`Viewing plans for ${type.name}`);
  }

  editType(type: InsuranceType): void {
    this.toastr.info(`Editing ${type.name}`);
  }

  editSubtype(subtype: InsuranceSubtype): void {
    this.toastr.info(`Editing ${subtype.name}`);
  }

  deleteSubtype(subtype: InsuranceSubtype): void {
    if (confirm(`Delete ${subtype.name}?`)) {
      this.toastr.success('Plan deleted successfully');
      this.loadAllSubtypes();
    }
  }
}
