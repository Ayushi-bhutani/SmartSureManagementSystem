import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private authService = inject(AuthService);
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor() {
    // Load notifications from localStorage
    this.loadNotifications();
    
    // Add role-based demo notifications
    this.addDemoNotifications();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const current = this.notifications$.value;
    const updated = [newNotification, ...current];
    
    this.notifications$.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  markAsRead(notificationId: string): void {
    const current = this.notifications$.value;
    const updated = current.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    this.notifications$.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  markAllAsRead(): void {
    const current = this.notifications$.value;
    const updated = current.map(n => ({ ...n, read: true }));
    
    this.notifications$.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  deleteNotification(notificationId: string): void {
    const current = this.notifications$.value;
    const updated = current.filter(n => n.id !== notificationId);
    
    this.notifications$.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  clearAll(): void {
    this.notifications$.next([]);
    this.unreadCount$.next(0);
    this.saveNotifications();
  }

  private updateUnreadCount(): void {
    const unread = this.notifications$.value.filter(n => !n.read).length;
    this.unreadCount$.next(unread);
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('smartsure_notifications', JSON.stringify(this.notifications$.value));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('smartsure_notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        notifications.forEach((n: any) => {
          n.timestamp = new Date(n.timestamp);
        });
        this.notifications$.next(notifications);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private addDemoNotifications(): void {
    // Only add demo notifications if there are no existing notifications
    if (this.notifications$.value.length === 0) {
      let demoNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [];

      // Admin-specific notifications
      if (this.authService.isAdmin()) {
        demoNotifications = [
          {
            type: 'warning',
            title: 'Pending Claims Review',
            message: '4 new claims are awaiting your review and approval.',
            actionUrl: '/admin/claims',
            actionText: 'Review Claims'
          },
          {
            type: 'info',
            title: 'New User Registration',
            message: '3 new users registered today. Verify their accounts.',
            actionUrl: '/admin/users',
            actionText: 'View Users'
          },
          {
            type: 'success',
            title: 'Monthly Report Ready',
            message: 'Your monthly analytics report for March 2026 is now available.',
            actionUrl: '/admin/reports',
            actionText: 'View Report'
          }
        ];
      }
      // Customer-specific notifications
      else if (this.authService.isCustomer()) {
        demoNotifications = [
          {
            type: 'success',
            title: 'Policy Activated',
            message: 'Your vehicle insurance policy has been activated successfully.',
            actionUrl: '/customer/policies',
            actionText: 'View Policy'
          },
          {
            type: 'info',
            title: 'Claim Update',
            message: 'Your claim is under review by our team.',
            actionUrl: '/customer/claims',
            actionText: 'View Claim'
          },
          {
            type: 'warning',
            title: 'Policy Renewal Due',
            message: 'Your home insurance policy will expire in 30 days. Renew now to avoid coverage gaps.',
            actionUrl: '/customer/policies',
            actionText: 'Renew Now'
          }
        ];
      }

      demoNotifications.forEach(notif => this.addNotification(notif));
    }
  }

  private clearCustomerNotifications(): void {
    // This method is no longer needed since we handle role-based notifications properly
    // Keeping it empty for backward compatibility
  }
}
