import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsComponent } from './payments';
import { PolicyService } from '../../../policies/services/policy.service';
import { PaymentService, PaymentStatus, PaymentType } from '../../services/payment.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PolicyStatus } from '../../../policies/models/policy';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;
  let mockPolicyService: any;
  let mockPaymentService: any;
  let mockSnackBar: any;
  let mockDialog: any;
  let mockCdr: any;

  const mockPolicies = [
    {
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
    },
    {
      policyId: 2,
      policyNumber: 'POL-002',
      planName: 'Premium Plan',
      userId: 1,
      userName: 'John Doe',
      planId: 2,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumPaid: 200,
      remainingCoverage: 100000,
      status: PolicyStatus.Active,
      autoRenew: true
    }
  ];

  const mockPayments = [
    {
      paymentId: 1,
      paymentReference: 'PAY-001',
      policyId: 1,
      policyNumber: 'POL-001',
      amount: 100,
      paymentType: PaymentType.Premium,
      paymentMethod: 'Credit Card',
      paymentDate: new Date(),
      status: PaymentStatus.Completed,
      notes: 'Monthly premium'
    }
  ];

  beforeEach(async () => {
    mockPolicyService = {
      getMyPolicies: () => of(mockPolicies)
    };

    mockPaymentService = {
      getMyPayments: () => of(mockPayments),
      processPremiumPayment: (data: any) => of(mockPayments[0])
    };

    mockSnackBar = {
      open: () => ({})
    };

    mockDialog = {
      open: () => ({
        afterClosed: () => of(null)
      })
    };

    mockCdr = {
      detectChanges: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [PaymentsComponent, BrowserAnimationsModule],
      providers: [
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load policies on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.policies.length).toBe(2);
  });

  it('should load payments on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.payments.length).toBe(1);
  });

  it('should mark policy as paid if recent payment exists', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.paidPolicies.has(1)).toBe(true);
  });

  it('should process premium payment successfully', async () => {
    let snackBarCalled = false;
    mockSnackBar.open = (message: string) => {
      snackBarCalled = true;
      expect(message).toContain('Payment successful');
      return {};
    };

    // Mock dialog to return payment method
    mockDialog.open = () => ({
      afterClosed: () => of({ paymentMethod: 'Credit Card', notes: 'Test payment' })
    });

    component.payPremium(mockPolicies[1]);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(snackBarCalled).toBe(true);
    expect(component.paidPolicies.has(2)).toBe(true);
  });

  it('should handle payment error', async () => {
    mockPaymentService.processPremiumPayment = () => throwError(() => new Error('Payment failed'));

    let snackBarCalled = false;
    mockSnackBar.open = (message: string) => {
      snackBarCalled = true;
      expect(message).toContain('Payment failed');
      return {};
    };

    // Mock dialog to return payment method
    mockDialog.open = () => ({
      afterClosed: () => of({ paymentMethod: 'Credit Card', notes: 'Test payment' })
    });

    component.payPremium(mockPolicies[1]);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(snackBarCalled).toBe(true);
  });

  it('should prevent double payment submission', () => {
    component.processingPayment.add(1);
    
    let dialogCalled = false;
    mockDialog.open = () => {
      dialogCalled = true;
      return { afterClosed: () => of(null) };
    };

    component.payPremium(mockPolicies[0]);

    expect(dialogCalled).toBe(false);
  });

  it('should check if policy is paid', () => {
    component.paidPolicies.add(1);
    expect(component.isPaid(mockPolicies[0])).toBe(true);
    expect(component.isPaid(mockPolicies[1])).toBe(false);
  });

  it('should return correct payment status color', () => {
    component.paidPolicies.add(1);
    expect(component.getPaymentStatusColor(mockPolicies[0])).toBe('primary');
    expect(component.getPaymentStatusColor(mockPolicies[1])).toBe('warn');
  });

  it('should return correct payment status text', () => {
    component.paidPolicies.add(1);
    expect(component.getPaymentStatusText(mockPolicies[0])).toBe('Paid');
    expect(component.getPaymentStatusText(mockPolicies[1])).toBe('Due');
  });

  it('should calculate next due date correctly', () => {
    const dueDate = component.getNextDueDate(mockPolicies[0]);
    const expectedDate = new Date('2026-01-01');
    expectedDate.setDate(expectedDate.getDate() + 30);
    
    expect(dueDate.getDate()).toBe(expectedDate.getDate());
    expect(dueDate.getMonth()).toBe(expectedDate.getMonth());
  });

  it('should handle error when loading policies', async () => {
    mockPolicyService.getMyPolicies = () => throwError(() => new Error('Load failed'));
    
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return {};
    };

    component.ngOnInit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(snackBarCalled).toBe(true);
  });

  it('should filter only active policies', async () => {
    const policiesWithInactive = [
      ...mockPolicies,
      {
        ...mockPolicies[0],
        policyId: 3,
        policyNumber: 'POL-003',
        remainingCoverage: 25000,
        status: PolicyStatus.Expired
      }
    ];

    mockPolicyService.getMyPolicies = () => of(policiesWithInactive);

    component.ngOnInit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.policies.length).toBe(2);
    expect(component.policies.every(p => p.status === PolicyStatus.Active)).toBe(true);
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toContain('policyNumber');
    expect(component.displayedColumns).toContain('planName');
    expect(component.displayedColumns).toContain('premiumAmount');
    expect(component.displayedColumns).toContain('dueDate');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns).toContain('actions');
  });
});
