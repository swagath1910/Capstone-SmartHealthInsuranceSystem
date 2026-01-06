import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { User, UserRole } from '../../../features/admin/models/user';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  currentRoute = '';

  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Admin', 'ClaimsOfficer', 'PolicyHolder', 'InsuranceAgent'] },
    { label: 'Policies', icon: 'policy', route: '/policies', roles: ['InsuranceAgent'] },
    { label: 'My Policies', icon: 'assignment_ind', route: '/my-policies', roles: ['PolicyHolder'] },
    { label: 'Claims', icon: 'assignment', route: '/claims', roles: ['ClaimsOfficer', 'HospitalStaff'] },
    { label: 'My Claims', icon: 'description', route: '/my-claims', roles: ['PolicyHolder'] },
    { label: 'Create Claim', icon: 'add_box', route: '/claims/create', roles: ['PolicyHolder'] },
    { label: 'Insurance Plans', icon: 'medical_services', route: '/insurance-plans', roles: ['Admin', 'PolicyHolder'] },
    { label: 'Hospitals', icon: 'local_hospital', route: '/hospitals', roles: ['Admin'] },
    { label: 'Payments', icon: 'payment', route: '/payments', roles: ['PolicyHolder'] },
    { label: 'Payment History', icon: 'history', route: '/payment-history', roles: ['PolicyHolder'] },
    { label: 'Users', icon: 'people', route: '/users', roles: ['Admin'] },
    { label: 'Enroll Customer', icon: 'person_add', route: '/users/create', roles: ['InsuranceAgent'] },
    { label: 'Reports', icon: 'assessment', route: '/reports', roles: ['InsuranceAgent', 'ClaimsOfficer'] },
  ];

  navItems: NavItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateNavItems();
      this.cdr.detectChanges();
    });
  }

  updateNavItems(): void {
    if (!this.currentUser) {
      this.navItems = [];
      return;
    }

    const userRoleText = this.getRoleText(this.currentUser.role);
    this.navItems = this.allNavItems.filter(item => 
      item.roles.includes(userRoleText)
    );
    this.cdr.detectChanges();
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
}
