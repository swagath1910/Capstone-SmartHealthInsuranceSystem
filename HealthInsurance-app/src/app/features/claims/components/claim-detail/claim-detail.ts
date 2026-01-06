import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Claim, ClaimStatus } from '../../models/claim';
import { UserRole } from '../../../admin/models/user';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './claim-detail.html',
  styleUrls: ['./claim-detail.css']
})
export class ClaimDetailComponent implements OnInit {
  claim: Claim | null = null;
  error: string | null = null;
  isLoading = true;
  showReviewForm = false;
  isSubmitting = false;
  reviewForm: FormGroup;
  ClaimStatus = ClaimStatus;
  currentUserRole: UserRole | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private claimService: ClaimService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.reviewForm = this.fb.group({
      status: ['', Validators.required],
      approvedAmount: [''],
      rejectionReason: ['']
    });

    // Get current user role synchronously to avoid ExpressionChangedAfterItHasBeenCheckedError
    const currentUser = this.authService.getCurrentUser();
    this.currentUserRole = currentUser?.role || null;
  }

  ngOnInit(): void {
    const claimId = this.route.snapshot.paramMap.get('id');
    console.log('Claim ID from route:', claimId);
    if (claimId) {
      this.loadClaim(+claimId);
    } else {
      this.error = 'Invalid claim ID';
    }
  }

  loadClaim(id: number): void {
    console.log('Loading claim with ID:', id);
    this.claimService.getClaimById(id)
      .pipe(
        timeout(3000), // Reduced to 3 second timeout
        catchError(error => {
          console.error('Error loading claim:', error);
          if (error.name === 'TimeoutError') {
            this.error = 'Request timed out. Please try again.';
          } else if (error.status === 404) {
            this.error = 'Claim not found';
          } else if (error.status === 403) {
            this.error = 'You do not have permission to view this claim';
          } else {
            this.error = 'Failed to load claim details';
          }
          this.snackBar.open(this.error, 'Close', { duration: 3000 });
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (claim) => {
          console.log('Claim loaded successfully:', claim);
          this.claim = claim;
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection
        },
        error: (error) => {
          console.error('Subscribe error:', error);
          this.isLoading = false;
        }
      });
  }

  getStatusClass(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.Submitted:
        return 'status-submitted';
      case ClaimStatus.InReview:
        return 'status-in-review';
      case ClaimStatus.Approved:
        return 'status-approved';
      case ClaimStatus.Rejected:
        return 'status-rejected';
      case ClaimStatus.Paid:
        return 'status-paid';
      default:
        return '';
    }
  }

  canReview(): boolean {
    if (!this.claim) return false;
    return this.currentUserRole === UserRole.ClaimsOfficer &&
           this.claim.status === ClaimStatus.InReview &&
           !!this.claim.medicalNotes;
  }

  startReview(): void {
    this.showReviewForm = true;
  }

  cancelReview(): void {
    this.showReviewForm = false;
    this.reviewForm.reset();
  }

  submitReview(): void {
    if (this.reviewForm.valid && this.claim) {
      this.isSubmitting = true;
      const formValue = this.reviewForm.value;
      const reviewData = {
        status: formValue.status,
        approvedAmount: formValue.status === ClaimStatus.Approved ? 
          (formValue.approvedAmount || this.claim.claimAmount) : undefined,
        rejectionReason: formValue.status === ClaimStatus.Rejected ? 
          formValue.rejectionReason : undefined
      };

      this.claimService.reviewClaim(this.claim.claimId, reviewData).subscribe({
        next: (updated) => {
          this.snackBar.open('Claim reviewed successfully!', 'Close', { duration: 3000 });
          this.showReviewForm = false;
          this.isSubmitting = false;
          // Use the returned updated claim data instead of reloading
          this.claim = updated;
          // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.snackBar.open('Failed to review claim', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === UserRole.PolicyHolder) {
      this.router.navigate(['/my-claims']);
    } else {
      this.router.navigate(['/claims']);
    }
  }
}
