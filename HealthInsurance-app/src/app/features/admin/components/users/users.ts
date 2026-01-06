import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { User, UserRole } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  displayedColumns = ['name', 'email', 'phoneNumber', 'role', 'isActive', 'actions'];
  
  // Filter properties
  searchTerm: string = '';
  selectedRole: UserRole | '' = '';
  selectedStatus: string = '';
  
  // Pagination properties
  pageSize: number = 5;
  pageIndex: number = 0;
  
  // Expose UserRole enum to template
  UserRole = UserRole;

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          return nameA.localeCompare(nameB);
        });
        this.filteredUsers = this.users;
        this.updatePaginatedUsers();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Search filter
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.toLowerCase().includes(searchLower);

      // Role filter
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;

      // Status filter
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
    this.pageIndex = 0;
    this.updatePaginatedUsers();
    this.cdr.detectChanges();
  }

  sortData(sort: Sort): void {
    const data = this.filteredUsers.slice();
    if (!sort.active || sort.direction === '') {
      this.filteredUsers = data;
      this.updatePaginatedUsers();
      return;
    }

    this.filteredUsers = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return compare(a.id, b.id, isAsc);
        case 'name':
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          return compare(nameA, nameB, isAsc);
        case 'email':
          return compare(a.email, b.email, isAsc);
        case 'phoneNumber':
          return compare(a.phoneNumber || '', b.phoneNumber || '', isAsc);
        case 'role':
          return compare(a.role, b.role, isAsc);
        case 'isActive':
          return compare(a.isActive ? 1 : 0, b.isActive ? 1 : 0, isAsc);
        default:
          return 0;
      }
    });
    this.updatePaginatedUsers();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedRole !== '' || this.selectedStatus !== '';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  getRoleText(role: UserRole): string {
    switch (role) {
      case UserRole.Admin: return 'Admin';
      case UserRole.InsuranceAgent: return 'Insurance Agent';
      case UserRole.ClaimsOfficer: return 'Claims Officer';
      case UserRole.HospitalStaff: return 'Hospital Staff';
      case UserRole.PolicyHolder: return 'Policy Holder';
      default: return 'Unknown';
    }
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.Admin: return 'role-admin';
      case UserRole.InsuranceAgent: return 'role-agent';
      case UserRole.ClaimsOfficer: return 'role-officer';
      case UserRole.HospitalStaff: return 'role-staff';
      case UserRole.PolicyHolder: return 'role-holder';
      default: return '';
    }
  }

  editUser(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    
    // Show confirmation popup only for deactivation
    if (user.isActive) {
      const confirmed = confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}? This will prevent them from accessing the system.`);
      if (!confirmed) {
        return;
      }
    }
    
    const request = user.isActive 
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);
    
    request.subscribe({
      next: () => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index].isActive = !user.isActive;
          this.cdr.detectChanges();
        }
        this.snackBar.open(`User ${action}d successfully!`, 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.snackBar.open(`Failed to ${action} user. Please try again.`, 'Close', { duration: 3000 });
      }
    });
  }

  createUser(): void {
    this.router.navigate(['/users/create']);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
