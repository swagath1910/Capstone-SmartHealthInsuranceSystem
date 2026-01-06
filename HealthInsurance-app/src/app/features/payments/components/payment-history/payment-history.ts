import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentStatus, PaymentType } from '../../models/payment';

@Component({
  selector: 'app-payment-history',
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
  templateUrl: './payment-history.html',
  styleUrls: ['./payment-history.css']
})
export class PaymentHistoryComponent implements OnInit {
  payments: Payment[] = [];
  loading = false;
  displayedColumns = ['paymentReference', 'referenceNumber', 'amount', 'paymentType', 'paymentMethod', 'paymentDate', 'status'];

  constructor(
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    this.loading = true;
    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load payment history', 'Close', { duration: 3000 });
        console.error('Payment history error:', error);
      }
    });
  }

  getStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'status-pending';
      case PaymentStatus.Completed:
        return 'status-completed';
      case PaymentStatus.Failed:
        return 'status-failed';
      case PaymentStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'Pending';
      case PaymentStatus.Completed:
        return 'Completed';
      case PaymentStatus.Failed:
        return 'Failed';
      case PaymentStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getPaymentTypeClass(type: PaymentType): string {
    switch (type) {
      case PaymentType.Premium:
        return 'type-premium';
      case PaymentType.ClaimPayout:
        return 'type-payout';
      default:
        return '';
    }
  }

  getPaymentTypeText(type: PaymentType): string {
    switch (type) {
      case PaymentType.Premium:
        return 'Premium';
      case PaymentType.ClaimPayout:
        return 'Claim Payout';
      default:
        return 'Unknown';
    }
  }

  getPaymentType(payment: Payment): string {
    return payment.policyId ? 'Premium' : 'Claim Payout';
  }

  getPaymentIcon(payment: Payment): string {
    return payment.policyId ? 'credit_card' : 'payment';
  }

  getPaymentClass(payment: Payment): string {
    return payment.policyId ? 'premium-payment' : 'claim-payment';
  }

  getReferenceNumber(payment: Payment): string {
    return payment.policyNumber || payment.claimNumber || 'N/A';
  }

  getPaymentMethodIcon(method?: string): string {
    if (!method) return 'payment';
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes('credit') || lowerMethod.includes('card')) {
      return 'credit_card';
    } else if (lowerMethod.includes('bank') || lowerMethod.includes('transfer')) {
      return 'account_balance';
    } else if (lowerMethod.includes('wallet') || lowerMethod.includes('upi')) {
      return 'account_balance_wallet';
    } else if (lowerMethod.includes('claim') || lowerMethod.includes('payout')) {
      return 'payment';
    }
    return 'payment';
  }
}
