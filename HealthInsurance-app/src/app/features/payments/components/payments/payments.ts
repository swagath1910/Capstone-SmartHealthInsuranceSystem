import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PolicyService } from '../../../policies/services/policy.service';
import { Policy, PolicyStatus } from '../../../policies/models/policy';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentStatus } from '../../models/payment';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog';

@Component({
  selector: 'app-payments',
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
  templateUrl: './payments.html',
  styleUrls: ['./payments.css']
})
export class PaymentsComponent implements OnInit {
  policies: Policy[] = [];
  payments: Payment[] = [];
  paidPolicies: Set<number> = new Set();
  processingPayment: Set<number> = new Set();
  displayedColumns = ['policyNumber', 'planName', 'premiumAmount', 'dueDate', 'status', 'actions'];

  constructor(
    private policyService: PolicyService,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load both policies and payments
    this.policyService.getMyPolicies().subscribe({
      next: (policies) => {
        this.policies = policies.filter(p => p.status === PolicyStatus.Active);
        this.loadPayments();
      },
      error: (error) => {
        this.snackBar.open('Failed to load policies', 'Close', { duration: 3000 });
      }
    });
  }

  loadPayments(): void {
    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        console.log('Loaded payments:', payments);
        
        // Mark policies as paid if they have a recent payment (within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Clear existing paid policies
        this.paidPolicies.clear();
        
        payments.forEach(payment => {
          const paymentDate = new Date(payment.paymentDate);
          console.log(`Payment for policy ${payment.policyId}: Date=${paymentDate}, Status=${payment.status}, Type=${typeof payment.status}`);
          
          // Check if payment is completed (enum value is 2)
          if (payment.policyId && paymentDate >= thirtyDaysAgo && payment.status === PaymentStatus.Completed) {
            console.log(`Marking policy ${payment.policyId} as paid`);
            this.paidPolicies.add(payment.policyId);
          }
        });
        
        console.log('Paid policies:', Array.from(this.paidPolicies));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load payments', error);
      }
    });
  }

  payPremium(policy: Policy): void {
    if (this.processingPayment.has(policy.policyId)) {
      return; // Prevent double submission
    }

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { 
        policy: policy,
        type: 'premium'
      }
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
      amount: amount,
      paymentMethod: paymentMethod,
      notes: notes
    };

    this.paymentService.processPremiumPayment(paymentData).subscribe({
      next: (payment) => {
        this.paidPolicies.add(policy.policyId);
        this.processingPayment.delete(policy.policyId);
        this.snackBar.open(`Payment successful for policy ${policy.policyNumber}!`, 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.processingPayment.delete(policy.policyId);
        this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
        console.error('Payment error:', error);
      }
    });
  }

  isPaid(policy: Policy): boolean {
    return this.paidPolicies.has(policy.policyId);
  }

  getPaymentStatusColor(policy: Policy): string {
    return this.isPaid(policy) ? 'primary' : 'warn';
  }

  getPaymentStatusText(policy: Policy): string {
    return this.isPaid(policy) ? 'Paid' : 'Due';
  }

  getNextDueDate(policy: Policy): Date {
    // Calculate next due date (30 days from start date for demo)
    const dueDate = new Date(policy.startDate);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate;
  }
}