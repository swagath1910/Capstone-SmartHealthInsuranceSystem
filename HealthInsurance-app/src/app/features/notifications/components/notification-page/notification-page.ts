import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../models/model-notification';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './notification-page.html',
  styleUrls: ['./notification-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationPageComponent implements OnInit, OnDestroy {
  allNotifications: Notification[] = [];
  displayedNotifications: Notification[] = [];
  loading = false;
  selectedFilter: 'all' | 'unread' | 'policy' | 'claim' = 'all';
  private destroy$ = new Subject<void>();

  NotificationType = NotificationType;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.allNotifications = notifications;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      });

    this.notificationService.getMyNotifications().subscribe();
  }

  applyFilter(): void {
    switch (this.selectedFilter) {
      case 'all':
        this.displayedNotifications = this.allNotifications;
        break;
      case 'unread':
        this.displayedNotifications = this.allNotifications.filter(n => !n.isRead);
        break;
      case 'policy':
        this.displayedNotifications = this.allNotifications.filter(
          n => n.type === NotificationType.PolicyEnrollment || 
               n.type === NotificationType.PolicyRenewal
        );
        break;
      case 'claim':
        this.displayedNotifications = this.allNotifications.filter(
          n => n.type === NotificationType.ClaimStatusUpdate
        );
        break;
    }
    this.cdr.detectChanges();
  }

  setFilter(filter: 'all' | 'unread' | 'policy' | 'claim'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read - just display the message, don't navigate
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.notificationId).subscribe();
    }
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.notificationId).subscribe();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.PolicyEnrollment:
        return 'verified_user';
      case NotificationType.PolicyRenewal:
        return 'autorenew';
      case NotificationType.ClaimStatusUpdate:
        return 'medical_services';
      default:
        return 'notifications';
    }
  }

  getNotificationIconColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.PolicyEnrollment:
        return 'primary';
      case NotificationType.PolicyRenewal:
        return 'accent';
      case NotificationType.ClaimStatusUpdate:
        return 'warn';
      default:
        return '';
    }
  }

  getNotificationTypeText(type: NotificationType): string {
    switch (type) {
      case NotificationType.PolicyEnrollment:
        return 'Policy Enrollment';
      case NotificationType.PolicyRenewal:
        return 'Policy Renewal';
      case NotificationType.ClaimStatusUpdate:
        return 'Claim Update';
      default:
        return 'Notification';
    }
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  getUnreadCount(): number {
    return this.allNotifications.filter(n => !n.isRead).length;
  }
}
