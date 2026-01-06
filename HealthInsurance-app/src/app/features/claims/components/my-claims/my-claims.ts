import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaimService } from '../../services/claim.service';
import { Claim, ClaimStatus } from '../../models/claim';

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './my-claims.html',
  styleUrls: ['./my-claims.css']
})
export class MyClaimsComponent implements OnInit {
  claims: Claim[] = [];
  displayedColumns = ['claimNumber', 'policyNumber', 'hospitalName', 'claimAmount', 'approvedAmount', 'status', 'submittedAt', 'actions'];

  constructor(
    private claimService: ClaimService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.claimService.getMyClaims().subscribe({
      next: (claims) => {
        this.claims = claims;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to load claims', 'Close', { duration: 3000 });
      }
    });
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

  createClaim(): void {
    this.router.navigate(['/claims/create']);
  }

  viewDetails(claim: Claim): void {
    this.router.navigate(['/claims', claim.claimId]);
  }
}