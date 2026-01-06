import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentHistoryComponent } from './payment-history';
import { PaymentService, PaymentStatus, PaymentType } from '../../services/payment.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

describe('PaymentHistoryComponent', () => {
  let component: PaymentHistoryComponent;
  let fixture: ComponentFixture<PaymentHistoryComponent>;
  let mockPaymentService: any;
  let mockSnackBar: any;

  const mockPayments = [
    {
      paymentId: 1,
      paymentReference: 'PAY-001',
      policyId: 1,
      policyNumber: 'POL-001',
      amount: 100,
      paymentType: PaymentType.Premium,
      paymentMethod: 'Credit Card',
      paymentDate: new Date('2026-01-01'),
      status: PaymentStatus.Completed,
      notes: 'Monthly premium'
    },
    {
      paymentId: 2,
      paymentReference: 'PAY-002',
      policyId: 2,
      policyNumber: 'POL-002',
      amount: 5000,
      paymentType: PaymentType.ClaimPayout,
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date('2026-01-02'),
      status: PaymentStatus.Pending,
      notes: 'Claim payout'
    }
  ];

  beforeEach(async () => {
    mockPaymentService = {
      getMyPayments: () => of(mockPayments)
    };

    mockSnackBar = {
      open: () => ({})
    };

    await TestBed.configureTestingModule({
      imports: [PaymentHistoryComponent, BrowserAnimationsModule],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load payment history on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.payments.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should return correct status class for Pending', () => {
    expect(component.getStatusClass(PaymentStatus.Pending)).toBe('status-pending');
  });

  it('should return correct status class for Completed', () => {
    expect(component.getStatusClass(PaymentStatus.Completed)).toBe('status-completed');
  });

  it('should return correct status class for Failed', () => {
    expect(component.getStatusClass(PaymentStatus.Failed)).toBe('status-failed');
  });

  it('should return correct status class for Cancelled', () => {
    expect(component.getStatusClass(PaymentStatus.Cancelled)).toBe('status-cancelled');
  });

  it('should return correct status text for Pending', () => {
    expect(component.getStatusText(PaymentStatus.Pending)).toBe('Pending');
  });

  it('should return correct status text for Completed', () => {
    expect(component.getStatusText(PaymentStatus.Completed)).toBe('Completed');
  });

  it('should return correct status text for Failed', () => {
    expect(component.getStatusText(PaymentStatus.Failed)).toBe('Failed');
  });

  it('should return correct status text for Cancelled', () => {
    expect(component.getStatusText(PaymentStatus.Cancelled)).toBe('Cancelled');
  });

  it('should return correct payment type class for Premium', () => {
    expect(component.getPaymentTypeClass(PaymentType.Premium)).toBe('type-premium');
  });

  it('should return correct payment type class for ClaimPayout', () => {
    expect(component.getPaymentTypeClass(PaymentType.ClaimPayout)).toBe('type-payout');
  });

  it('should return correct payment type text for Premium', () => {
    expect(component.getPaymentTypeText(PaymentType.Premium)).toBe('Premium');
  });

  it('should return correct payment type text for ClaimPayout', () => {
    expect(component.getPaymentTypeText(PaymentType.ClaimPayout)).toBe('Claim Payout');
  });

  it('should return credit_card icon for credit card method', () => {
    expect(component.getPaymentMethodIcon('Credit Card')).toBe('credit_card');
  });

  it('should return account_balance icon for bank transfer method', () => {
    expect(component.getPaymentMethodIcon('Bank Transfer')).toBe('account_balance');
  });

  it('should return account_balance_wallet icon for wallet method', () => {
    expect(component.getPaymentMethodIcon('UPI Wallet')).toBe('account_balance_wallet');
  });

  it('should return default payment icon for unknown method', () => {
    expect(component.getPaymentMethodIcon('Unknown')).toBe('payment');
  });

  it('should return default payment icon for undefined method', () => {
    expect(component.getPaymentMethodIcon(undefined)).toBe('payment');
  });

  it('should handle error when loading payment history', async () => {
    mockPaymentService.getMyPayments = () => throwError(() => new Error('Load failed'));
    
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return {};
    };

    component.ngOnInit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(snackBarCalled).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should set loading to true when loading payment history', () => {
    component.loading = false;
    component.loadPaymentHistory();
    expect(component.loading).toBe(true);
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toContain('paymentReference');
    expect(component.displayedColumns).toContain('policyNumber');
    expect(component.displayedColumns).toContain('amount');
    expect(component.displayedColumns).toContain('paymentType');
    expect(component.displayedColumns).toContain('paymentMethod');
    expect(component.displayedColumns).toContain('paymentDate');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns).toContain('notes');
  });
});
