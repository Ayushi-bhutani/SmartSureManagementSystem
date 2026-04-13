import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="notificationMenu" class="notification-button">
      <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn">
        notifications
      </mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
        <button mat-button (click)="markAllAsRead()" *ngIf="unreadCount > 0">
          Mark all read
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="notifications-list" (click)="$event.stopPropagation()">
        <div *ngIf="notifications.length === 0" class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications</p>
        </div>

        <div *ngFor="let notification of notifications" 
             class="notification-item"
             [class.unread]="!notification.read"
             (click)="handleNotificationClick(notification)">
          <div class="notification-icon" [class]="notification.type">
            <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
          </div>
          
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ getTimeAgo(notification.timestamp) }}</div>
          </div>

          <button mat-icon-button (click)="deleteNotification($event, notification.id)" class="delete-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <mat-divider *ngIf="notifications.length > 0"></mat-divider>

      <div class="notification-footer" (click)="$event.stopPropagation()" *ngIf="notifications.length > 0">
        <button mat-button (click)="clearAll()">
          <mat-icon>delete_sweep</mat-icon>
          Clear All
        </button>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-button {
      margin-left: 8px;
    }

    ::ng-deep .notification-menu {
      max-width: 400px !important;
      width: 400px !important;
    }

    ::ng-deep .notification-menu .mat-mdc-menu-content {
      padding: 0 !important;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f9fafb;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background: #f9fafb;
    }

    .notification-item.unread {
      background: #eff6ff;
    }

    .notification-item.unread::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #3b82f6;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: white;
    }

    .notification-icon.info {
      background: #3b82f6;
    }

    .notification-icon.success {
      background: #22c55e;
    }

    .notification-icon.warning {
      background: #f59e0b;
    }

    .notification-icon.error {
      background: #ef4444;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .delete-btn {
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-item:hover .delete-btn {
      opacity: 1;
    }

    .notification-footer {
      padding: 12px 16px;
      background: #f9fafb;
      text-align: center;
    }

    .notification-footer button {
      width: 100%;
    }
  `]
})
export class NotificationPanelComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  notifications: Notification[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'info': 'info',
      'success': 'check_circle',
      'warning': 'warning',
      'error': 'error'
    };
    return icons[type] || 'notifications';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  handleNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
    
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  deleteNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll();
    }
  }
}
