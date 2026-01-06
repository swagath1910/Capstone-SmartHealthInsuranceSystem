import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Policy } from '../../../policies/models/policy';
import { Claim } from '../../../claims/models/claim';

export interface PaymentDialogData {
  policy?: Policy;
  claim?: Claim;
  type: 'premium' | 'claim';
}

export interface PaymentDialogResult {
  amount: number;
  paymentMethod: string;
  notes?: string;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './payment-dialog.html',
  styleUrls: ['./payment-dialog.css']
})
export class PaymentDialogComponent {
  paymentForm: FormGroup;
  policy?: Policy;
  claim?: Claim;
  dialogType: 'premium' | 'claim';

  paymentMethods = [
    { value: 'CreditCard', label: 'Credit Card' },
    { value: 'DebitCard', label: 'Debit Card' },
    { value: 'BankTransfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Check', label: 'Check' },
    { value: 'ClaimPayout', label: 'Claim Payout' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.policy = data.policy;
    this.claim = data.claim;
    this.dialogType = data.type || 'premium'; // Default to premium if type not provided
    
    const defaultPaymentMethod = this.dialogType === 'claim' ? 'ClaimPayout' : 'CreditCard';
    
    this.paymentForm = this.fb.group({
      paymentMethod: [defaultPaymentMethod, this.dialogType === 'premium' ? Validators.required : null],
      notes: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.paymentForm.valid) {
      const amount = this.dialogType === 'claim' 
        ? (this.claim?.approvedAmount || this.claim?.claimAmount || 0)
        : (this.policy?.premiumPaid || 0);
        
      const result: PaymentDialogResult = {
        amount: amount,
        paymentMethod: this.paymentForm.value.paymentMethod,
        notes: this.paymentForm.value.notes || undefined
      };
      this.dialogRef.close(result);
    }
  }

  getSuggestedAnnualAmount(): number {
    return this.policy?.premiumPaid ? this.policy.premiumPaid * 12 : 0;
  }

  getDialogTitle(): string {
    return this.dialogType === 'claim' ? 'Confirm Claim Payment' : 'Process Premium Payment';
  }

  getAmountLabel(): string {
    return this.dialogType === 'claim' ? 'Claim Amount' : 'Premium Amount';
  }

  getAvailablePaymentMethods() {
    if (this.dialogType === 'claim') {
      return this.paymentMethods.filter(method => method.value === 'ClaimPayout');
    } else {
      return this.paymentMethods.filter(method => method.value !== 'ClaimPayout');
    }
  }

  getPaymentAmount(): number {
    return this.dialogType === 'claim' 
      ? (this.claim?.approvedAmount || this.claim?.claimAmount || 0)
      : (this.policy?.premiumPaid || 0);
  }
}
