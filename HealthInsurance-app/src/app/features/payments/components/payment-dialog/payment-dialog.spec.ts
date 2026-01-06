import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentDialogComponent, PaymentDialogData } from './payment-dialog';
import { PolicyStatus } from '../../../policies/models/policy';

describe('PaymentDialogComponent', () => {
  let component: PaymentDialogComponent;
  let fixture: ComponentFixture<PaymentDialogComponent>;
  let mockDialogRef: any;

  const mockPolicy = {
    policyId: 1,
    policyNumber: 'POL-001',
    planName: 'Basic Plan',
    userId: 1,
    userName: 'John Doe',
    planId: 1,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-01-01'),
    premiumPaid: 100,
    remainingCoverage: 50000,
    status: PolicyStatus.Active,
    autoRenew: true
  };

  const mockDialogData: PaymentDialogData = {
    policy: mockPolicy
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };

    await TestBed.configureTestingModule({
      imports: [PaymentDialogComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with policy data', () => {
    expect(component.policy).toEqual(mockPolicy);
  });

  it('should initialize form with default values', () => {
    expect(component.paymentForm.get('paymentMethod')?.value).toBe('CreditCard');
    expect(component.paymentForm.get('notes')?.value).toBe('');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should close dialog with result on confirm', () => {
    component.paymentForm.patchValue({
      paymentMethod: 'DebitCard',
      notes: 'Test payment'
    });

    component.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      amount: 100,
      paymentMethod: 'DebitCard',
      notes: 'Test payment'
    });
  });

  it('should not close dialog if form is invalid', () => {
    component.paymentForm.patchValue({
      paymentMethod: ''
    });

    component.onConfirm();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should calculate suggested annual amount', () => {
    const annualAmount = component.getSuggestedAnnualAmount();
    expect(annualAmount).toBe(1200); // 100 * 12
  });

  it('should have correct payment methods', () => {
    expect(component.paymentMethods).toEqual([
      { value: 'CreditCard', label: 'Credit Card' },
      { value: 'DebitCard', label: 'Debit Card' },
      { value: 'BankTransfer', label: 'Bank Transfer' },
      { value: 'Cash', label: 'Cash' },
      { value: 'Check', label: 'Check' }
    ]);
  });
});