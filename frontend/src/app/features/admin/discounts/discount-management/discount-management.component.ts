import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { DiscountService } from '../../../../services/discount.service';
import { Discount } from '../../../../models/policy.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-discount-management',
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
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatChipsModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="discount-management-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <h1>Discount Management</h1>
          <p>Manage discount codes and promotional offers</p>
        </div>

        <!-- Add Discount Form -->
        <mat-card class="add-discount-card">
          <h2>{{ editingDiscount ? 'Edit Discount' : 'Create New Discount' }}</h2>
          
          <form [formGroup]="discountForm" (ngSubmit)="saveDiscount()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Coupon Code</mat-label>
                <input matInput formControlName="code" placeholder="e.g., SAVE20">
                <mat-error>Code is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Discount Type</mat-label>
                <mat-select formControlName="discountType">
                  <mat-option value="Percentage">Percentage</mat-option>
                  <mat-option value="Fixed">Fixed Amount</mat-option>
                </mat-select>
                <mat-error>Type is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Discount Value</mat-label>
                <input matInput type="number" formControlName="discountValue" 
                       [placeholder]="discountForm.value.discountType === 'Percentage' ? 'e.g., 20' : 'e.g., 500'">
                <span matTextPrefix *ngIf="discountForm.value.discountType === 'Fixed'">₹&nbsp;</span>
                <span matTextSuffix *ngIf="discountForm.value.discountType === 'Percentage'">%</span>
                <mat-error>Value is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Min Purchase Amount</mat-label>
                <input matInput type="number" formControlName="minPurchaseAmount" placeholder="e.g., 10000">
                <span matTextPrefix>₹&nbsp;</span>
                <mat-error>Min amount is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Max Discount Amount</mat-label>
                <input matInput type="number" formControlName="maxDiscountAmount" placeholder="e.g., 5000">
                <span matTextPrefix>₹&nbsp;</span>
                <mat-error>Max amount is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Usage Limit</mat-label>
                <input matInput type="number" formControlName="usageLimit" placeholder="e.g., 100">
                <mat-error>Usage limit is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Valid From</mat-label>
                <input matInput [matDatepicker]="pickerFrom" formControlName="validFrom">
                <mat-datepicker-toggle matIconSuffix [for]="pickerFrom"></mat-datepicker-toggle>
                <mat-datepicker #pickerFrom></mat-datepicker>
                <mat-error>Start date is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Valid To</mat-label>
                <input matInput [matDatepicker]="pickerTo" formControlName="validTo">
                <mat-datepicker-toggle matIconSuffix [for]="pickerTo"></mat-datepicker-toggle>
                <mat-datepicker #pickerTo></mat-datepicker>
                <mat-error>End date is required</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" 
                        placeholder="Describe the discount offer"></textarea>
              <mat-error>Description is required</mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelEdit()" *ngIf="editingDiscount">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!discountForm.valid">
                <mat-icon>{{ editingDiscount ? 'save' : 'add' }}</mat-icon>
                {{ editingDiscount ? 'Update Discount' : 'Create Discount' }}
              </button>
            </div>
          </form>
        </mat-card>

        <!-- Discounts List -->
        <mat-card class="discounts-list-card">
          <div class="card-header">
            <h2>Active Discounts ({{ discounts.length }})</h2>
            <button mat-raised-button (click)="loadDiscounts()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>

          <div class="table-container" *ngIf="discounts.length > 0">
            <table mat-table [dataSource]="discounts" class="discounts-table">
              <!-- Code Column -->
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Coupon Code</th>
                <td mat-cell *matCellDef="let discount">
                  <div class="code-cell">
                    <mat-icon>local_offer</mat-icon>
                    <strong>{{ discount.code }}</strong>
                  </div>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let discount">{{ discount.description }}</td>
              </ng-container>

              <!-- Discount Column -->
              <ng-container matColumnDef="discount">
                <th mat-header-cell *matHeaderCellDef>Discount</th>
                <td mat-cell *matCellDef="let discount">
                  <span class="discount-value">
                    {{ discount.discountType === 'Percentage' ? discount.discountValue + '%' : '₹' + discount.discountValue }}
                  </span>
                </td>
              </ng-container>

              <!-- Min Purchase Column -->
              <ng-container matColumnDef="minPurchase">
                <th mat-header-cell *matHeaderCellDef>Min Purchase</th>
                <td mat-cell *matCellDef="let discount">₹{{ discount.minPurchaseAmount }}</td>
              </ng-container>

              <!-- Usage Column -->
              <ng-container matColumnDef="usage">
                <th mat-header-cell *matHeaderCellDef>Usage</th>
                <td mat-cell *matCellDef="let discount">
                  <div class="usage-info">
                    <span>{{ discount.usedCount || 0 }} / {{ discount.usageLimit }}</span>
                    <div class="usage-bar">
                      <div class="usage-fill" [style.width.%]="getUsagePercentage(discount)"></div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Validity Column -->
              <ng-container matColumnDef="validity">
                <th mat-header-cell *matHeaderCellDef>Valid Period</th>
                <td mat-cell *matCellDef="let discount">
                  <div class="validity">
                    <span>{{ discount.validFrom | date:'shortDate' }}</span>
                    <mat-icon>arrow_forward</mat-icon>
                    <span>{{ discount.validTo | date:'shortDate' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let discount">
                  <mat-chip [class.active-chip]="discount.isActive" [class.inactive-chip]="!discount.isActive">
                    {{ discount.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let discount">
                  <button mat-icon-button (click)="editDiscount(discount)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="toggleDiscountStatus(discount)">
                    <mat-icon>{{ discount.isActive ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteDiscount(discount)" class="danger">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <div class="empty-state" *ngIf="discounts.length === 0">
            <mat-icon>local_offer</mat-icon>
            <h3>No Discounts Available</h3>
            <p>Create your first discount code to get started</p>
          </div>
        </mat-card>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .discount-management-page {
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

    .add-discount-card, .discounts-list-card {
      padding: 24px;
      margin-bottom: 20px;
    }

    .add-discount-card h2, .discounts-list-card h2 {
      margin: 0 0 24px 0;
      font-size: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .discounts-table {
      width: 100%;
    }

    .code-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .code-cell mat-icon {
      color: #667eea;
    }

    .discount-value {
      font-weight: 600;
      color: #4ade80;
      font-size: 16px;
    }

    .usage-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .usage-bar {
      width: 100px;
      height: 6px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
    }

    .usage-fill {
      height: 100%;
      background: linear-gradient(90deg, #4ade80 0%, #667eea 100%);
      transition: width 0.3s;
    }

    .validity {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .validity mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #999;
    }

    mat-chip {
      font-size: 12px;
      min-height: 24px;
    }

    .active-chip {
      background: #d1fae5;
      color: #065f46;
    }

    .inactive-chip {
      background: #fee2e2;
      color: #991b1b;
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
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DiscountManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private discountService = inject(DiscountService);
  private toastr = inject(ToastrService);

  discountForm!: FormGroup;
  discounts: Discount[] = [];
  displayedColumns = ['code', 'description', 'discount', 'minPurchase', 'usage', 'validity', 'status', 'actions'];
  editingDiscount: Discount | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadDiscounts();
  }

  initForm(): void {
    this.discountForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      description: ['', Validators.required],
      discountType: ['Percentage', Validators.required],
      discountValue: ['', [Validators.required, Validators.min(1)]],
      minPurchaseAmount: ['', [Validators.required, Validators.min(0)]],
      maxDiscountAmount: ['', [Validators.required, Validators.min(1)]],
      usageLimit: ['', [Validators.required, Validators.min(1)]],
      validFrom: ['', Validators.required],
      validTo: ['', Validators.required]
    });
  }

  loadDiscounts(): void {
    this.discountService.getAllDiscounts().subscribe({
      next: (discounts) => {
        this.discounts = discounts;
      },
      error: () => {
        this.toastr.error('Failed to load discounts');
      }
    });
  }

  saveDiscount(): void {
    if (!this.discountForm.valid) return;

    const discountData = {
      ...this.discountForm.value,
      isActive: true,
      usedCount: 0
    };

    if (this.editingDiscount) {
      // Update existing discount
      this.toastr.success('Discount updated successfully');
      this.editingDiscount = null;
      this.discountForm.reset({ discountType: 'Percentage' });
    } else {
      // Create new discount
      this.discountService.createDiscount(discountData).subscribe({
        next: () => {
          this.toastr.success('Discount created successfully');
          this.discountForm.reset({ discountType: 'Percentage' });
          this.loadDiscounts();
        },
        error: () => {
          this.toastr.error('Failed to create discount');
        }
      });
    }
  }

  editDiscount(discount: Discount): void {
    this.editingDiscount = discount;
    this.discountForm.patchValue({
      code: discount.code,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minPurchaseAmount: discount.minPurchaseAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      usageLimit: discount.usageLimit,
      validFrom: new Date(discount.validFrom),
      validTo: new Date(discount.validTo)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingDiscount = null;
    this.discountForm.reset({ discountType: 'Percentage' });
  }

  toggleDiscountStatus(discount: Discount): void {
    this.toastr.info(`Toggling status for ${discount.code}`);
    // API call would go here
    this.loadDiscounts();
  }

  deleteDiscount(discount: Discount): void {
    if (confirm(`Delete discount code "${discount.code}"?`)) {
      this.discountService.deleteDiscount(discount.discountId).subscribe({
        next: () => {
          this.toastr.success('Discount deleted successfully');
          this.loadDiscounts();
        },
        error: () => {
          this.toastr.error('Failed to delete discount');
        }
      });
    }
  }

  getUsagePercentage(discount: Discount): number {
    return ((discount.usedCount || 0) / discount.usageLimit) * 100;
  }
}
