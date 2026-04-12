import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/auth.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand" [routerLink]="getHomeRoute()" style="cursor: pointer;">
          <mat-icon>shield</mat-icon>
          <span class="brand-name">SmartSure</span>
        </div>

        <div class="spacer"></div>

        <div class="navbar-menu" *ngIf="currentUser">
          <!-- Customer Menu -->
          <ng-container *ngIf="authService.isCustomer()">
            <button mat-button routerLink="/customer/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
            <button mat-button routerLink="/customer/policies" routerLinkActive="active">
              <mat-icon>description</mat-icon>
              My Policies
            </button>
            <button mat-button routerLink="/customer/buy-policy" routerLinkActive="active">
              <mat-icon>add_shopping_cart</mat-icon>
              Buy Policy
            </button>
            <button mat-button routerLink="/customer/claims" routerLinkActive="active">
              <mat-icon>assignment</mat-icon>
              My Claims
            </button>
          </ng-container>

          <!-- Admin Menu -->
          <ng-container *ngIf="authService.isAdmin()">
            <button mat-button routerLink="/admin/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
            <button mat-button routerLink="/admin/policies" routerLinkActive="active">
              <mat-icon>description</mat-icon>
              Policies
            </button>
            <button mat-button routerLink="/admin/claims" routerLinkActive="active">
              <mat-icon>assignment</mat-icon>
              Claims
            </button>
            <button mat-button [matMenuTriggerFor]="adminMenu">
              <mat-icon>settings</mat-icon>
              Manage
            </button>
            <mat-menu #adminMenu="matMenu">
              <button mat-menu-item routerLink="/admin/insurance-types">
                <mat-icon>category</mat-icon>
                Insurance Types
              </button>
              <button mat-menu-item routerLink="/admin/discounts">
                <mat-icon>local_offer</mat-icon>
                Discounts
              </button>
              <button mat-menu-item routerLink="/admin/users">
                <mat-icon>people</mat-icon>
                Users
              </button>
              <button mat-menu-item routerLink="/admin/reports">
                <mat-icon>assessment</mat-icon>
                Reports
              </button>
              <button mat-menu-item routerLink="/admin/audit-logs">
                <mat-icon>history</mat-icon>
                Audit Logs
              </button>
            </mat-menu>
          </ng-container>

          <!-- User Menu -->
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
            <mat-icon>account_circle</mat-icon>
            <span>{{ currentUser.firstName }}</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
              <div class="user-role">{{ currentUser.role }}</div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item [routerLink]="getProfileRoute()">
              <mat-icon>person</mat-icon>
              Profile
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              Logout
            </button>
          </mat-menu>
        </div>

        <div class="navbar-menu" *ngIf="!currentUser">
          <button mat-button routerLink="/auth/login">
            <mat-icon>login</mat-icon>
            Login
          </button>
          <button mat-raised-button color="accent" routerLink="/auth/register">
            <mat-icon>person_add</mat-icon>
            Register
          </button>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-container {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 500;
    }

    .brand-name {
      font-weight: 600;
    }

    .spacer {
      flex: 1;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .navbar-menu button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .navbar-menu button.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-menu-btn {
      margin-left: 16px;
    }

    .user-info {
      padding: 16px;
      background-color: #f5f5f5;
    }

    .user-name {
      font-weight: 500;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .user-email {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .user-role {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }

    @media (max-width: 768px) {
      .navbar-menu button span:not(.brand-name) {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  currentUser: User | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getHomeRoute(): string {
    if (this.authService.isAdmin()) {
      return '/admin/dashboard';
    } else if (this.authService.isCustomer()) {
      return '/customer/dashboard';
    }
    return '/';
  }

  getProfileRoute(): string {
    if (this.authService.isAdmin()) {
      return '/admin/profile';
    }
    return '/customer/profile';
  }

  logout(): void {
    this.authService.logout();
  }
}
