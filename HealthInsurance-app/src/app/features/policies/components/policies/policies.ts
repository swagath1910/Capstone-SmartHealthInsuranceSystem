import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PolicyService } from '../../services/policy.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Policy, PolicyStatus } from '../../models/policy';
import { UserRole } from '../../../admin/models/user';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './policies.html',
  styleUrls: ['./policies.css']
})
export class PoliciesComponent implements OnInit {
  policies: Policy[] = [];
  filteredPolicies: Policy[] = [];
  paginatedPolicies: Policy[] = [];
  displayedColumns: string[] = [];
  
  // Filter properties
  searchTerm: string = '';
  selectedStatus: PolicyStatus | '' = '';
  selectedAutoRenew: string = '';
  
  // Pagination properties
  pageSize: number = 5;
  pageIndex: number = 0;
  
  // Expose PolicyStatus enum to template
  PolicyStatus = PolicyStatus;

  constructor(
    private policyService: PolicyService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Redirect policy holders to my-policies component
    if (!this.isAdmin() && !this.isAgent()) {
      this.router.navigate(['/my-policies']);
      return;
    }
    
    this.setupColumns();
    this.loadPolicies();
  }

  setupColumns(): void {
    this.displayedColumns = ['policyNumber'];
    
    if (this.showUserColumn()) {
      this.displayedColumns.push('userName');
    }
    
    this.displayedColumns.push(
      'planName',
      'startDate', 
      'endDate',
      'premiumPaid'
    );
    
    // Add remaining coverage for policy holders
    if (!this.isAdmin() && !this.isAgent()) {
      this.displayedColumns.push('remainingCoverage');
    }
    
    this.displayedColumns.push('status', 'actions');
  }

  loadPolicies(): void {
    const loadMethod = this.isAdmin() || this.isAgent() ? 
      this.policyService.getAllPolicies() : 
      this.policyService.getMyPolicies();

    loadMethod.subscribe({
      next: (policies) => {
        this.policies = policies.sort((a, b) => a.policyId - b.policyId);
        this.filteredPolicies = this.policies;
        this.updatePaginatedPolicies();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        
        let errorMessage = 'Failed to load policies';
        if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please ensure the backend is running on https://localhost:7075';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (error.status === 403) {
          errorMessage = 'Access forbidden. You do not have permission to view policies.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  applyFilters(): void {
    this.filteredPolicies = this.policies.filter(policy => {
      // Search filter
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        policy.policyNumber.toLowerCase().includes(searchLower) ||
        policy.userName.toLowerCase().includes(searchLower) ||
        policy.planName.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !this.selectedStatus || policy.status === this.selectedStatus;

      // Auto-renew filter
      const matchesAutoRenew = !this.selectedAutoRenew || 
        (this.selectedAutoRenew === 'yes' && policy.autoRenew) ||
        (this.selectedAutoRenew === 'no' && !policy.autoRenew);

      return matchesSearch && matchesStatus && matchesAutoRenew;
    });
    this.pageIndex = 0;
    this.updatePaginatedPolicies();
    this.cdr.detectChanges();
  }

  sortData(sort: Sort): void {
    const data = this.filteredPolicies.slice();
    if (!sort.active || sort.direction === '') {
      this.filteredPolicies = data;
      this.updatePaginatedPolicies();
      return;
    }

    this.filteredPolicies = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'policyNumber':
          return compare(a.policyNumber, b.policyNumber, isAsc);
        case 'userName':
          return compare(a.userName, b.userName, isAsc);
        case 'planName':
          return compare(a.planName, b.planName, isAsc);
        case 'startDate':
          return compare(new Date(a.startDate).getTime(), new Date(b.startDate).getTime(), isAsc);
        case 'endDate':
          return compare(new Date(a.endDate).getTime(), new Date(b.endDate).getTime(), isAsc);
        case 'premiumPaid':
          return compare(a.premiumPaid, b.premiumPaid, isAsc);
        case 'status':
          return compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
    this.updatePaginatedPolicies();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedAutoRenew = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedStatus !== '' || this.selectedAutoRenew !== '';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedPolicies();
  }

  updatePaginatedPolicies(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPolicies = this.filteredPolicies.slice(startIndex, endIndex);
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.Admin;
  }

  isAgent(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.InsuranceAgent;
  }

  showUserColumn(): boolean {
    return this.isAdmin() || this.isAgent();
  }

  canCreatePolicy(): boolean {
    return this.isAdmin() || this.isAgent();
  }

  canEditPolicy(): boolean {
    return this.isAdmin() || this.isAgent();
  }

  canRenewPolicy(policy: Policy): boolean {
    return (this.isAdmin() || this.isAgent()) && 
           (policy.status === PolicyStatus.Active || policy.status === PolicyStatus.Expired);
  }

  canDeletePolicy(): boolean {
    // Only Insurance Agents can delete policies, NOT Admins
    return this.isAgent();
  }

  getStatusColor(status: PolicyStatus): string {
    switch (status) {
      case PolicyStatus.Active: return 'primary';
      case PolicyStatus.Expired: return 'warn';
      case PolicyStatus.Suspended: return 'accent';
      case PolicyStatus.Cancelled: return '';
      default: return '';
    }
  }

  getStatusText(status: PolicyStatus): string {
    switch (status) {
      case PolicyStatus.Active: return 'Active';
      case PolicyStatus.Expired: return 'Expired';
      case PolicyStatus.Suspended: return 'Suspended';
      case PolicyStatus.Cancelled: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  viewPolicy(policy: Policy): void {
    this.router.navigate(['/policies', policy.policyId]);
  }

  createPolicy(): void {
    this.router.navigate(['/policies/create']);
  }

  editPolicy(policy: Policy): void {
    this.router.navigate(['/policies/edit', policy.policyId]);
  }

  renewPolicy(policy: Policy): void {
    this.policyService.renewPolicy(policy.policyId).subscribe({
      next: (renewedPolicy) => {
        this.snackBar.open('Policy renewed successfully', 'Close', { duration: 3000 });
        this.loadPolicies();
      },
      error: (error) => {
        this.snackBar.open('Failed to renew policy', 'Close', { duration: 3000 });
      }
    });
  }

  payPremium(policy: Policy): void {
    this.router.navigate(['/payments/premium', policy.policyId]);
  }

  deletePolicy(policy: Policy): void {
    if (confirm(`Are you sure you want to delete policy ${policy.policyNumber}? This action cannot be undone.`)) {
      this.policyService.deletePolicy(policy.policyId).subscribe({
        next: () => {
          this.snackBar.open(`Policy ${policy.policyNumber} deleted successfully!`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPolicies();
        },
        error: (error) => {
          console.error('Delete error details:', error);
          let errorMessage = 'Failed to delete policy. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 500) {
            errorMessage = 'Server error occurred while deleting policy. Please contact support.';
          } else if (error.status === 404) {
            errorMessage = 'Policy not found or already deleted.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete this policy.';
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
