import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Claim, ClaimStatus } from '../../models/claim';
import { UserRole } from '../../../admin/models/user';
import { HospitalClaimsComponent } from '../hospital-claims/hospital-claims';
import { PaymentDialogComponent } from '../../../payments/components/payment-dialog/payment-dialog';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-claims',
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
    MatPaginatorModule,
    MatTooltipModule,
    HospitalClaimsComponent
  ],
  templateUrl: './claims.html',
  styleUrls: ['./claims.css']
})
export class ClaimsComponent implements OnInit {
  claims: Claim[] = [];
  filteredClaims: Claim[] = [];
  paginatedClaims: Claim[] = [];
  displayedColumns: string[] = [];
  
  // Filter properties
  searchTerm: string = '';
  selectedStatus: ClaimStatus | '' = '';
  
  // Pagination properties
  pageSize: number = 5;
  pageIndex: number = 0;
  
  processingPayments: Set<number> = new Set();
  
  // Expose ClaimStatus enum to template
  ClaimStatus = ClaimStatus;

  constructor(
    private claimService: ClaimService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    // Listen for navigation events to refresh data when returning from claim detail
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/claims') {
        this.loadClaims();
      }
    });
  }

  ngOnInit(): void {
    this.setupColumns();
    this.loadClaims();
  }

  setupColumns(): void {
    this.displayedColumns = ['claimNumber'];
    
    if (this.showUserColumn()) {
      this.displayedColumns.push('userName');
    }
    
    this.displayedColumns.push(
      'policyNumber',
      'hospitalName',
      'claimAmount',
      'approvedAmount',
      'status',
      'submittedAt',
      'actions'
    );
  }

  loadClaims(): void {
    if (this.isHospitalStaff()) {
      // Hospital staff should use the hospital claims component instead
      return;
    }
    
    let loadMethod;
    if (this.isClaimsOfficer() || this.isAdmin()) {
      loadMethod = this.claimService.getAllClaims();
    } else {
      loadMethod = this.claimService.getMyClaims();
    }

    loadMethod.subscribe({
      next: (claims) => {
        this.claims = claims.sort((a, b) => {
          return b.claimNumber.localeCompare(a.claimNumber);
        });
        this.filteredClaims = this.claims;
        this.updatePaginatedClaims();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to load claims', 'Close', { duration: 3000 });
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.Admin;
  }

  isClaimsOfficer(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.ClaimsOfficer;
  }

  isPolicyHolder(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.PolicyHolder;
  }

  isHospitalStaff(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.HospitalStaff;
  }

  showUserColumn(): boolean {
    return this.isAdmin() || this.isClaimsOfficer();
  }

  canCreateClaim(): boolean {
    return this.isPolicyHolder();
  }

  canReviewClaim(claim: Claim): boolean {
    return (this.isAdmin() || this.isClaimsOfficer()) && 
           !!claim.medicalNotes && 
           claim.status === ClaimStatus.InReview;
  }

  canMarkAsPaid(claim: Claim): boolean {
    return (this.isAdmin() || this.isClaimsOfficer()) && 
           claim.status === ClaimStatus.Approved;
  }

  getStatusClass(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.Submitted: return 'status-submitted';
      case ClaimStatus.InReview: return 'status-in-review';
      case ClaimStatus.Approved: return 'status-approved';
      case ClaimStatus.Rejected: return 'status-rejected';
      case ClaimStatus.Paid: return 'status-paid';
      default: return '';
    }
  }

  getStatusText(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.Submitted: return 'Submitted';
      case ClaimStatus.InReview: return 'In Review';
      case ClaimStatus.Approved: return 'Approved';
      case ClaimStatus.Rejected: return 'Rejected';
      case ClaimStatus.Paid: return 'Paid';
      default: return 'Unknown';
    }
  }

  viewClaim(claim: Claim): void {
    this.router.navigate(['/claims', claim.claimId]);
  }

  createClaim(): void {
    this.router.navigate(['/claims/create']);
  }

  reviewClaim(claim: Claim): void {
    this.router.navigate(['/claims', claim.claimId]);
  }

  applyFilters(): void {
    this.filteredClaims = this.claims.filter(claim => {
      // Search filter
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        claim.claimNumber.toLowerCase().includes(searchLower) ||
        claim.policyNumber.toLowerCase().includes(searchLower) ||
        claim.hospitalName.toLowerCase().includes(searchLower) ||
        claim.userName.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !this.selectedStatus || claim.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
    this.pageIndex = 0;
    this.updatePaginatedClaims();
    this.cdr.detectChanges();
  }

  sortData(sort: Sort): void {
    const data = this.filteredClaims.slice();
    if (!sort.active || sort.direction === '') {
      this.filteredClaims = data;
      this.updatePaginatedClaims();
      return;
    }

    this.filteredClaims = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'claimNumber':
          return compare(a.claimNumber, b.claimNumber, isAsc);
        case 'userName':
          return compare(a.userName, b.userName, isAsc);
        case 'policyNumber':
          return compare(a.policyNumber, b.policyNumber, isAsc);
        case 'hospitalName':
          return compare(a.hospitalName, b.hospitalName, isAsc);
        case 'claimAmount':
          return compare(a.claimAmount, b.claimAmount, isAsc);
        case 'approvedAmount':
          return compare(a.approvedAmount || 0, b.approvedAmount || 0, isAsc);
        case 'status':
          return compare(a.status, b.status, isAsc);
        case 'submittedAt':
          return compare(new Date(a.submittedAt).getTime(), new Date(b.submittedAt).getTime(), isAsc);
        default:
          return 0;
      }
    });
    this.updatePaginatedClaims();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedStatus !== '';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedClaims();
  }

  updatePaginatedClaims(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedClaims = this.filteredClaims.slice(startIndex, endIndex);
  }

  markAsPaid(claim: Claim): void {
    // Prevent double-click
    if (this.processingPayments.has(claim.claimId)) {
      return;
    }

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { 
        claim: claim,
        type: 'claim'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processClaimPayment(claim);
      }
    });
  }

  processClaimPayment(claim: Claim): void {
    // Add to processing set
    this.processingPayments.add(claim.claimId);

    this.claimService.markAsPaid(claim.claimId).subscribe({
      next: (updated) => {
        this.snackBar.open('Claim marked as paid successfully!', 'Close', { duration: 3000 });
        // Update the claim in the local array
        const index = this.claims.findIndex(c => c.claimId === claim.claimId);
        if (index !== -1) {
          this.claims[index] = updated;
          this.applyFilters(); // Refresh the filtered and paginated data
        }
        // Remove from processing set
        this.processingPayments.delete(claim.claimId);
      },
      error: (error) => {
        this.snackBar.open('Failed to mark claim as paid', 'Close', { duration: 3000 });
        // Remove from processing set on error
        this.processingPayments.delete(claim.claimId);
      }
    });
  }

  isProcessingPayment(claim: Claim): boolean {
    return this.processingPayments.has(claim.claimId);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}