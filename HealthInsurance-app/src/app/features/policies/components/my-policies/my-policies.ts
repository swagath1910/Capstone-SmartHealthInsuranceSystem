import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PolicyService } from '../../services/policy.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { Policy, PolicyStatus } from '../../models/policy';
import { PaymentDialogComponent } from '../../../payments/components/payment-dialog/payment-dialog';

@Component({
  selector: 'app-my-policies',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './my-policies.html',
  styleUrls: ['./my-policies.css']
})
export class MyPoliciesComponent implements OnInit {
  policies: Policy[] = [];
  displayedColumns = ['policyNumber', 'planName', 'startDate', 'endDate', 'premiumPaid', 'remainingCoverage', 'status', 'actions'];
  processingPayment: Set<number> = new Set();

  constructor(
    private policyService: PolicyService,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.policyService.getMyPolicies().subscribe({
      next: (policies) => {
        console.log('Received policies:', policies); // Debug log
        // Ensure all policies have default values for new fields
        this.policies = policies.map(policy => ({
          ...policy,
          remainingCoverage: policy.remainingCoverage ?? 0,
          coverageLimit: policy.coverageLimit ?? 50000, // Default coverage limit
          lastPremiumPaymentDate: policy.lastPremiumPaymentDate ?? undefined
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading policies:', error); // Debug log
        this.snackBar.open('Failed to load policies', 'Close', { duration: 3000 });
      }
    });
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

  canPayPremium(policy: Policy): boolean {
    return policy.status === PolicyStatus.Active || policy.status === PolicyStatus.Expired;
  }

  viewPolicy(policy: Policy): void {
    this.router.navigate(['/policies', policy.policyId]);
  }

  payPremium(policy: Policy): void {
    if (this.processingPayment.has(policy.policyId)) {
      return; // Prevent double submission
    }

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { policy }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processPayment(policy, result.amount, result.paymentMethod, result.notes);
      }
    });
  }

  processPayment(policy: Policy, amount: number, paymentMethod: string, notes?: string): void {
    this.processingPayment.add(policy.policyId);
    
    const paymentData = {
      policyId: policy.policyId,
      amount: amount, // Use the manually entered amount
      paymentMethod: paymentMethod,
      notes: notes || 'Premium payment'
    };

    this.paymentService.processPremiumPayment(paymentData).subscribe({
      next: (payment) => {
        this.processingPayment.delete(policy.policyId);
        this.snackBar.open(`Premium payment successful for policy ${policy.policyNumber}!`, 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Reload policies to reflect any status changes
        this.loadPolicies();
      },
      error: (error) => {
        this.processingPayment.delete(policy.policyId);
        const errorMessage = error.error?.message || 'Payment failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Payment error:', error);
      }
    });
  }

  getCoveragePercentage(policy: Policy): number {
    if (!policy.coverageLimit || policy.coverageLimit === 0) {
      // Fallback: assume remaining coverage is the percentage of some default limit
      return policy.remainingCoverage > 0 ? 100 : 0;
    }
    return (policy.remainingCoverage / policy.coverageLimit) * 100;
  }

  getCoverageColor(policy: Policy): string {
    const percentage = this.getCoveragePercentage(policy);
    if (percentage > 50) return 'primary';
    if (percentage > 25) return 'accent';
    return 'warn';
  }
}