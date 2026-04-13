import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { AdminService } from '../../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-generate-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatStepperModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="generate-report-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Generate New Report</h1>
        </div>

        <mat-stepper [linear]="true" #stepper>
          <!-- Step 1: Report Type -->
          <mat-step [stepControl]="reportTypeForm">
            <ng-template matStepLabel>Report Type</ng-template>
            <form [formGroup]="reportTypeForm" class="step-form">
              <h2>Select Report Type</h2>
              
              <div class="report-types-grid">
                <mat-card *ngFor="let type of reportTypes" 
                          class="report-type-card"
                          [class.selected]="reportTypeForm.value.reportType === type.value"
                          (click)="selectReportType(type.value)">
                  <mat-icon>{{ type.icon }}</mat-icon>
                  <h3>{{ type.label }}</h3>
                  <p>{{ type.description }}</p>
                </mat-card>
              </div>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!reportTypeForm.valid">
                  Next <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Date Range -->
          <mat-step [stepControl]="dateRangeForm">
            <ng-template matStepLabel>Date Range</ng-template>
            <form [formGroup]="dateRangeForm" class="step-form">
              <h2>Select Date Range</h2>

              <div class="date-range-options">
                <button mat-raised-button type="button" (click)="setDateRange('today')">Today</button>
                <button mat-raised-button type="button" (click)="setDateRange('week')">This Week</button>
                <button mat-raised-button type="button" (click)="setDateRange('month')">This Month</button>
                <button mat-raised-button type="button" (click)="setDateRange('quarter')">This Quarter</button>
                <button mat-raised-button type="button" (click)="setDateRange('year')">This Year</button>
              </div>

              <div class="date-fields">
                <mat-form-field appearance="outline">
                  <mat-label>Start Date</mat-label>
                  <input matInput [matDatepicker]="pickerStart" formControlName="startDate">
                  <mat-datepicker-toggle matIconSuffix [for]="pickerStart"></mat-datepicker-toggle>
                  <mat-datepicker #pickerStart></mat-datepicker>
                  <mat-error>Start date is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>End Date</mat-label>
                  <input matInput [matDatepicker]="pickerEnd" formControlName="endDate">
                  <mat-datepicker-toggle matIconSuffix [for]="pickerEnd"></mat-datepicker-toggle>
                  <mat-datepicker #pickerEnd></mat-datepicker>
                  <mat-error>End date is required</mat-error>
                </mat-form-field>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!dateRangeForm.valid">
                  Next <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Options -->
          <mat-step [stepControl]="optionsForm">
            <ng-template matStepLabel>Options</ng-template>
            <form [formGroup]="optionsForm" class="step-form">
              <h2>Report Options</h2>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Report Name</mat-label>
                <input matInput formControlName="reportName" placeholder="Enter report name">
                <mat-error>Report name is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Format</mat-label>
                <mat-select formControlName="format">
                  <mat-option value="PDF">PDF</mat-option>
                  <mat-option value="Excel">Excel</mat-option>
                  <mat-option value="CSV">CSV</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="checkboxes">
                <h3>Include Sections:</h3>
                <mat-checkbox formControlName="includeSummary">Summary</mat-checkbox>
                <mat-checkbox formControlName="includeCharts">Charts & Graphs</mat-checkbox>
                <mat-checkbox formControlName="includeDetails">Detailed Data</mat-checkbox>
                <mat-checkbox formControlName="includeComparison">Period Comparison</mat-checkbox>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button mat-raised-button color="primary" matStepperNext>
                  Review <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 4: Review & Generate -->
          <mat-step>
            <ng-template matStepLabel>Review</ng-template>
            <div class="step-form">
              <h2>Review & Generate</h2>

              <mat-card class="review-card">
                <div class="review-item">
                  <span class="label">Report Type:</span>
                  <span class="value">{{ getReportTypeLabel() }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Date Range:</span>
                  <span class="value">
                    {{ dateRangeForm.value.startDate | date:'mediumDate' }} - 
                    {{ dateRangeForm.value.endDate | date:'mediumDate' }}
                  </span>
                </div>
                <div class="review-item">
                  <span class="label">Report Name:</span>
                  <span class="value">{{ optionsForm.value.reportName }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Format:</span>
                  <span class="value">{{ optionsForm.value.format }}</span>
                </div>
              </mat-card>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button mat-raised-button color="accent" (click)="generateReport()" [disabled]="isGenerating">
                  <mat-icon>{{ isGenerating ? 'hourglass_empty' : 'play_arrow' }}</mat-icon>
                  {{ isGenerating ? 'Generating...' : 'Generate Report' }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .generate-report-page {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
    }

    mat-stepper {
      background: white;
      border-radius: 8px;
      padding: 20px;
    }

    .step-form {
      padding: 30px 20px;
    }

    .step-form h2 {
      margin: 0 0 30px 0;
      font-size: 24px;
    }

    .report-types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .report-type-card {
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .report-type-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .report-type-card.selected {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .report-type-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 12px;
    }

    .report-type-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .report-type-card p {
      margin: 0;
      font-size: 12px;
      color: #666;
    }

    .date-range-options {
      display: flex;
      gap: 12px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .date-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 30px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .checkboxes {
      margin-bottom: 30px;
    }

    .checkboxes h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .checkboxes mat-checkbox {
      display: block;
      margin-bottom: 12px;
    }

    .review-card {
      padding: 24px;
      margin-bottom: 30px;
    }

    .review-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .review-item:last-child {
      border-bottom: none;
    }

    .review-item .label {
      color: #666;
      font-weight: 500;
    }

    .review-item .value {
      color: #333;
      font-weight: 600;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    @media (max-width: 768px) {
      .report-types-grid {
        grid-template-columns: 1fr;
      }

      .date-fields {
        grid-template-columns: 1fr;
      }

      .date-range-options {
        flex-direction: column;
      }

      .date-range-options button {
        width: 100%;
      }
    }
  `]
})
export class GenerateReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  reportTypeForm!: FormGroup;
  dateRangeForm!: FormGroup;
  optionsForm!: FormGroup;
  isGenerating = false;

  reportTypes = [
    { value: 'Policy', label: 'Policy Report', icon: 'policy', description: 'Policies issued and status' },
    { value: 'Claims', label: 'Claims Report', icon: 'assignment', description: 'Claims filed and processed' },
    { value: 'Revenue', label: 'Revenue Report', icon: 'account_balance_wallet', description: 'Premium collection and revenue' },
    { value: 'Users', label: 'Users Report', icon: 'people', description: 'User registrations and activity' },
    { value: 'Performance', label: 'Performance Report', icon: 'trending_up', description: 'Overall system performance' }
  ];

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.reportTypeForm = this.fb.group({
      reportType: ['', Validators.required]
    });

    this.dateRangeForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.optionsForm = this.fb.group({
      reportName: ['', Validators.required],
      format: ['PDF', Validators.required],
      includeSummary: [true],
      includeCharts: [true],
      includeDetails: [false],
      includeComparison: [false]
    });
  }

  selectReportType(type: string): void {
    this.reportTypeForm.patchValue({ reportType: type });
    const reportType = this.reportTypes.find(t => t.value === type);
    if (reportType) {
      this.optionsForm.patchValue({
        reportName: `${reportType.label} - ${new Date().toLocaleDateString()}`
      });
    }
  }

  setDateRange(range: string): void {
    const now = new Date();
    let startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case 'today':
        startDate = new Date();
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    this.dateRangeForm.patchValue({
      startDate,
      endDate
    });
  }

  getReportTypeLabel(): string {
    const type = this.reportTypes.find(t => t.value === this.reportTypeForm.value.reportType);
    return type ? type.label : '';
  }

  generateReport(): void {
    if (!this.reportTypeForm.valid || !this.dateRangeForm.valid || !this.optionsForm.valid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.isGenerating = true;

    const reportData = {
      reportType: this.reportTypeForm.value.reportType,
      reportName: this.optionsForm.value.reportName,
      title: this.optionsForm.value.reportName, // Add title field
      startDate: this.dateRangeForm.value.startDate,
      endDate: this.dateRangeForm.value.endDate,
      format: this.optionsForm.value.format,
      options: {
        includeSummary: this.optionsForm.value.includeSummary,
        includeCharts: this.optionsForm.value.includeCharts,
        includeDetails: this.optionsForm.value.includeDetails,
        includeComparison: this.optionsForm.value.includeComparison
      }
    };

    this.adminService.generateReport(reportData).subscribe({
      next: () => {
        this.isGenerating = false;
        this.toastr.success('Report generated successfully!');
        setTimeout(() => {
          this.router.navigate(['/admin/reports']);
        }, 1500);
      },
      error: () => {
        this.isGenerating = false;
        this.toastr.error('Failed to generate report');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/reports']);
  }
}
