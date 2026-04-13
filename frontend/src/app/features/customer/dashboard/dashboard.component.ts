import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AiChatWidgetComponent } from '../../../shared/components/ai-chat-widget/ai-chat-widget.component';
import { PolicyService } from '../../../services/policy.service';
import { ClaimService } from '../../../services/claim.service';
import { AuthService } from '../../../core/services/auth.service';
import { Policy } from '../../../models/policy.models';
import { Claim } from '../../../models/claim.models';

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
    StatusBadgeComponent,
    AiChatWidgetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
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
    // Display full name instead of just first name
    if (user?.firstName && user?.lastName) {
      this.userName = `${user.firstName} ${user.lastName}`.trim();
    } else {
      this.userName = user?.firstName || (user as any)?.FirstName || 'User';
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.policyService.getMyPolicies(1, 5).subscribe({
      next: (policies) => {
        this.recentPolicies = policies.slice(0, 5);
        this.stats.totalPolicies = policies.length;
        this.stats.activePolicies = policies.filter((p: Policy) => p.status === 'Active').length;
      },
      error: () => {
        this.recentPolicies = [];
      }
    });

    this.claimService.getMyClaims(1, 5).subscribe({
      next: (response) => {
        this.recentClaims = response.items || [];
        this.stats.totalClaims = response.totalCount || 0;
        this.stats.pendingClaims = (response.items || []).filter(
          c => c.status === 'Submitted' || c.status === 'Under Review'
        ).length;
      },
      error: () => {
        this.recentClaims = [];
      }
    });
  }
}
