import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import '../../../chart.config'; // Import Chart.js configuration
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AnalyticsService } from '../../../services/analytics.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    BaseChartDirective,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="analytics-dashboard-page">
      <app-navbar></app-navbar>

      <div class="container">
        <div class="page-header">
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Comprehensive insights and data visualization</p>
          </div>
          <button mat-raised-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            Refresh Data
          </button>
        </div>

        <!-- Key Metrics -->
        <div class="metrics-grid">
          <mat-card class="metric-card">
            <div class="metric-icon approval">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="metric-content">
              <h3>{{ analytics?.claimApprovalRate || 0 }}%</h3>
              <p>Claim Approval Rate</p>
              <span class="trend positive">
                <mat-icon>trending_up</mat-icon>
                +5.2% from last month
              </span>
            </div>
          </mat-card>

          <mat-card class="metric-card">
            <div class="metric-icon amount">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="metric-content">
              <h3>₹{{ (analytics?.averageClaimAmount || 0) | number }}</h3>
              <p>Avg Claim Amount</p>
              <span class="trend neutral">
                <mat-icon>trending_flat</mat-icon>
                No change
              </span>
            </div>
          </mat-card>

          <mat-card class="metric-card">
            <div class="metric-icon policies">
              <mat-icon>policy</mat-icon>
            </div>
            <div class="metric-content">
              <h3>{{ analytics?.activePolicies || 0 | number }}</h3>
              <p>Active Policies</p>
              <span class="trend positive">
                <mat-icon>trending_up</mat-icon>
                +12% this quarter
              </span>
            </div>
          </mat-card>

          <mat-card class="metric-card">
            <div class="metric-icon growth">
              <mat-icon>people</mat-icon>
            </div>
            <div class="metric-content">
              <h3>{{ analytics?.totalUsers || 0 }}</h3>
              <p>New Users (30d)</p>
              <span class="trend positive">
                <mat-icon>trending_up</mat-icon>
                +18% growth
              </span>
            </div>
          </mat-card>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Policies by Type -->
          <mat-card class="chart-card">
            <div class="chart-header">
              <h2>Policies by Type</h2>
              <mat-icon>pie_chart</mat-icon>
            </div>
            <div class="chart-container">
              <canvas baseChart
                [data]="policiesByTypeData"
                [type]="'doughnut'"
                [options]="doughnutChartOptions">
              </canvas>
            </div>
          </mat-card>

          <!-- Claims by Status -->
          <mat-card class="chart-card">
            <div class="chart-header">
              <h2>Claims by Status</h2>
              <mat-icon>donut_large</mat-icon>
            </div>
            <div class="chart-container">
              <canvas baseChart
                [data]="claimsByStatusData"
                [type]="'pie'"
                [options]="pieChartOptions">
              </canvas>
            </div>
          </mat-card>

          <!-- Revenue Trend -->
          <mat-card class="chart-card full-width">
            <div class="chart-header">
              <h2>Revenue Trend (2026)</h2>
              <mat-icon>show_chart</mat-icon>
            </div>
            <div class="chart-container">
              <canvas baseChart
                [data]="revenueByMonthData"
                [type]="'line'"
                [options]="lineChartOptions">
              </canvas>
            </div>
          </mat-card>

          <!-- User Growth -->
          <mat-card class="chart-card full-width">
            <div class="chart-header">
              <h2>User Growth (This Month)</h2>
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="chart-container">
              <canvas baseChart
                [data]="userGrowthData"
                [type]="'bar'"
                [options]="barChartOptions">
              </canvas>
            </div>
          </mat-card>
        </div>

        <!-- Top Insurance Types -->
        <mat-card class="top-types-card">
          <h2>Top Insurance Types</h2>
          <div class="types-list">
            <div class="type-item" *ngFor="let type of analytics?.topInsuranceTypes">
              <div class="type-info">
                <span class="type-name">{{ type.name }}</span>
                <span class="type-count">{{ type.count }} policies</span>
              </div>
              <div class="type-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="type.percentage"></div>
                </div>
                <span class="percentage">{{ type.percentage }}%</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .analytics-dashboard-page {
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

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      padding: 24px;
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .metric-icon.approval {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    }

    .metric-icon.amount {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    }

    .metric-icon.policies {
      background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    }

    .metric-icon.growth {
      background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
    }

    .metric-content {
      flex: 1;
    }

    .metric-content h3 {
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .metric-content p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .trend mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .trend.positive {
      color: #22c55e;
    }

    .trend.neutral {
      color: #64748b;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      padding: 24px;
    }

    .chart-card.full-width {
      grid-column: 1 / -1;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-header h2 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .chart-header mat-icon {
      color: #667eea;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .top-types-card {
      padding: 24px;
    }

    .top-types-card h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
    }

    .types-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .type-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .type-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .type-name {
      font-weight: 600;
      color: #333;
    }

    .type-count {
      font-size: 14px;
      color: #666;
    }

    .type-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .percentage {
      font-size: 14px;
      font-weight: 600;
      color: #667eea;
      min-width: 45px;
      text-align: right;
    }

    @media (max-width: 968px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      .chart-card.full-width {
        grid-column: 1;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  private router = inject(Router);
  private analyticsService = inject(AnalyticsService);
  private toastr = inject(ToastrService);

  analytics: any;

  // Chart data
  policiesByTypeData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  claimsByStatusData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  revenueByMonthData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  userGrowthData: ChartConfiguration['data'] = { labels: [], datasets: [] };

  // Chart options
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.analyticsService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.policiesByTypeData = data.policiesByType;
        this.claimsByStatusData = data.claimsByStatus;
        this.revenueByMonthData = data.revenueByMonth;
        this.userGrowthData = data.userGrowth;
      },
      error: () => {
        this.toastr.error('Failed to load analytics data');
      }
    });
  }

  refreshData(): void {
    this.toastr.info('Refreshing analytics data...');
    this.loadAnalytics();
  }
}
