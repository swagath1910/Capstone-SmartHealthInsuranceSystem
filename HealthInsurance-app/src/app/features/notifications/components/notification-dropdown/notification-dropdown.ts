import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../models/model-notification';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './notification-dropdown.html',
  styleUrls: ['./notification-dropdown.css']
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  @Output() closeDropdown = new EventEmitter<void>();
  
  notifications: Notification[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

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
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 10); // Show only recent 10
        this.loading = false;
        this.cdr.detectChanges();
      });

    this.notificationService.getMyNotifications().subscribe();
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read - defer to avoid change detection errors
    if (!notification.isRead) {
      setTimeout(() => {
        this.notificationService.markAsRead(notification.notificationId).subscribe();
      }, 0);
    }
    
    // Navigate to notifications page to view full message
    this.router.navigate(['/notifications']);
    this.closeDropdown.emit();
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

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.closeDropdown.emit();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }
}
