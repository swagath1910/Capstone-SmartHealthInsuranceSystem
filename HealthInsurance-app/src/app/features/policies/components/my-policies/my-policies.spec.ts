import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPoliciesComponent } from './my-policies';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { PolicyStatus } from '../../models/policy';

describe('MyPoliciesComponent', () => {
  let component: MyPoliciesComponent;
  let fixture: ComponentFixture<MyPoliciesComponent>;
  let mockPolicyService: any;
  let mockSnackBar: any;

  const mockPolicies = [
    {
      policyId: 1,
      policyNumber: 'POL-001',
      userId: 1,
      userName: 'Test User',
      planId: 1,
      planName: 'Basic Plan',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      premiumPaid: 5000,
      remainingCoverage: 50000,
      status: PolicyStatus.Active,
      autoRenew: true,
      renewedOn: undefined
    },
    {
      policyId: 2,
      policyNumber: 'POL-002',
      userId: 1,
      userName: 'Test User',
      planId: 2,
      planName: 'Premium Plan',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      premiumPaid: 8000,
      remainingCoverage: 75000,
      status: PolicyStatus.Expired,
      autoRenew: false,
      renewedOn: undefined
    }
  ];

  beforeEach(async () => {
    mockPolicyService = {
      getMyPolicies: () => of(mockPolicies)
    };

    mockSnackBar = {
      open: (message: string, action?: string, config?: any) => ({
        onAction: () => of(null)
      })
    };

    await TestBed.configureTestingModule({
      imports: [MyPoliciesComponent, BrowserAnimationsModule],
      providers: [
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load policies on init', () => {
    expect(component.policies.length).toBe(2);
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toContain('policyNumber');
    expect(component.displayedColumns).toContain('planName');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns).toContain('actions');
    expect(component.displayedColumns.length).toBe(7);
  });

  it('should get correct status color for Active', () => {
    expect(component.getStatusColor(PolicyStatus.Active)).toBe('primary');
  });

  it('should get correct status color for Expired', () => {
    expect(component.getStatusColor(PolicyStatus.Expired)).toBe('warn');
  });

  it('should get correct status color for Suspended', () => {
    expect(component.getStatusColor(PolicyStatus.Suspended)).toBe('accent');
  });

  it('should get correct status color for Cancelled', () => {
    expect(component.getStatusColor(PolicyStatus.Cancelled)).toBe('');
  });

  it('should get correct status text for Active', () => {
    expect(component.getStatusText(PolicyStatus.Active)).toBe('Active');
  });

  it('should get correct status text for Expired', () => {
    expect(component.getStatusText(PolicyStatus.Expired)).toBe('Expired');
  });

  it('should get correct status text for Suspended', () => {
    expect(component.getStatusText(PolicyStatus.Suspended)).toBe('Suspended');
  });

  it('should get correct status text for Cancelled', () => {
    expect(component.getStatusText(PolicyStatus.Cancelled)).toBe('Cancelled');
  });

  it('should allow premium payment for Active policy', () => {
    const activePolicy = mockPolicies[0];
    expect(component.canPayPremium(activePolicy)).toBe(true);
  });

  it('should allow premium payment for Expired policy', () => {
    const expiredPolicy = mockPolicies[1];
    expect(component.canPayPremium(expiredPolicy)).toBe(true);
  });

  it('should not allow premium payment for Cancelled policy', () => {
    const cancelledPolicy = { ...mockPolicies[0], status: PolicyStatus.Cancelled, remainingCoverage: 50000 };
    expect(component.canPayPremium(cancelledPolicy)).toBe(false);
  });

  it('should display snackbar when viewing policy', () => {
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return { onAction: () => of(null) };
    };

    component.viewPolicy(mockPolicies[0]);
    expect(snackBarCalled).toBe(true);
  });

  it('should display snackbar when paying premium', () => {
    let snackBarCalled = false;
    let snackBarMessage = '';
    mockSnackBar.open = (message: string) => {
      snackBarCalled = true;
      snackBarMessage = message;
      return { onAction: () => of(null) };
    };

    component.payPremium(mockPolicies[0]);
    expect(snackBarCalled).toBe(true);
    expect(snackBarMessage).toContain('Payment successful');
  });

  it('should handle error when loading policies', () => {
    mockPolicyService.getMyPolicies = () => throwError(() => new Error('Failed'));
    
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return { onAction: () => of(null) };
    };

    component.loadPolicies();

    setTimeout(() => {
      expect(snackBarCalled).toBe(true);
    }, 100);
  });
});
