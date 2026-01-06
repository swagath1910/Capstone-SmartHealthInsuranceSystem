import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { User, UserRole } from '../../../features/admin/models/user';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { NotificationBellComponent } from '../../../features/notifications/components/notification-bell/notification-bell';
import { NotificationDropdownComponent } from '../../../features/notifications/components/notification-dropdown/notification-dropdown';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    NotificationBellComponent,
    NotificationDropdownComponent,
    OverlayModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  notificationCount = 0;
  showNotificationDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Start polling for notifications when user is logged in
        this.notificationService.startPolling();
      }
      this.cdr.detectChanges();
    });

    // Subscribe to unread count
    this.notificationService.unreadCount$.subscribe(count => {
      this.notificationCount = count;
      this.cdr.detectChanges();
    });
  }

  getRoleText(role: UserRole): string {
    switch (role) {
      case UserRole.Admin: return 'Admin';
      case UserRole.InsuranceAgent: return 'InsuranceAgent';
      case UserRole.ClaimsOfficer: return 'ClaimsOfficer';
      case UserRole.HospitalStaff: return 'HospitalStaff';
      case UserRole.PolicyHolder: return 'PolicyHolder';
      default: return 'User';
    }
  }

  getRoleDisplayText(role: UserRole): string {
    switch (role) {
      case UserRole.Admin: return 'Admin';
      case UserRole.InsuranceAgent: return 'Insurance Agent';
      case UserRole.ClaimsOfficer: return 'Claims Officer';
      case UserRole.HospitalStaff: return 'Hospital Staff';
      case UserRole.PolicyHolder: return 'Policy Holder';
      default: return 'User';
    }
  }

  hasAccess(roles: string[]): boolean {
    if (!this.currentUser) return false;
    const userRoleText = this.getRoleText(this.currentUser.role);
    return roles.includes(userRoleText);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.notificationService.refreshNotifications();
    }
  }

  closeNotificationDropdown(): void {
    this.showNotificationDropdown = false;
  }
}
