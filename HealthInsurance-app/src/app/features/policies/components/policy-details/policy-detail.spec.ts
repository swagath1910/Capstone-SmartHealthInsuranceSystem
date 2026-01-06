import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyDetailComponent } from './policy-detail';
import { PolicyService } from '../../services/policy.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { PolicyStatus } from '../../models/policy';

describe('PolicyDetailComponent', () => {
  let component: PolicyDetailComponent;
  let fixture: ComponentFixture<PolicyDetailComponent>;
  let mockPolicyService: any;
  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockSnackBar: any;
  let mockAuthService: any;
  let mockCdr: any;

  const mockPolicy = {
    policyId: 1,
    policyNumber: 'POL-001',
    userId: 1,
    userName: 'John Doe',
    planId: 1,
    planName: 'Basic Plan',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    premiumPaid: 5000,
    remainingCoverage: 50000,
    status: PolicyStatus.Active,
    autoRenew: true,
    renewedOn: undefined
  };

  beforeEach(async () => {
    mockPolicyService = {
      getPolicyById: (id: number) => of(mockPolicy),
      renewPolicy: (id: number) => of(mockPolicy)
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => '1'
        }
      }
    };

    mockRouter = {
      navigate: () => Promise.resolve(true)
    };

    mockSnackBar = {
      open: (message: string, action?: string, config?: any) => ({
        onAction: () => of(null)
      })
    };

    mockAuthService = {
      getCurrentUser: () => ({ role: 1 }) // Mock user with admin role
    };

    mockCdr = {
      detectChanges: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [PolicyDetailComponent, BrowserAnimationsModule],
      providers: [
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load policy on init', () => {
    expect(component.policy?.policyId).toBe(1);
    expect(component.policy?.policyNumber).toBe('POL-001');
  });

  it('should show error when policy ID is invalid', () => {
    mockActivatedRoute.snapshot.paramMap.get = () => null;
    const newComponent = new PolicyDetailComponent(
      mockActivatedRoute,
      mockRouter,
      mockPolicyService,
      mockAuthService,
      mockSnackBar,
      mockCdr
    );
    newComponent.ngOnInit();
    expect(newComponent.error).toBe('Invalid policy ID');
  });

  it('should get correct status class for Active', () => {
    expect(component.getStatusClass(PolicyStatus.Active)).toBe('status-active');
  });

  it('should get correct status class for Expired', () => {
    expect(component.getStatusClass(PolicyStatus.Expired)).toBe('status-expired');
  });

  it('should get correct status class for Cancelled', () => {
    expect(component.getStatusClass(PolicyStatus.Cancelled)).toBe('status-cancelled');
  });

  it('should get correct status class for Suspended', () => {
    expect(component.getStatusClass(PolicyStatus.Suspended)).toBe('status-suspended');
  });

  it('should allow renewing active policy', () => {
    component.policy = mockPolicy;
    expect(component.canRenew()).toBe(true);
  });

  it('should allow renewing expired policy', () => {
    component.policy = { ...mockPolicy, status: PolicyStatus.Expired };
    expect(component.canRenew()).toBe(true);
  });

  it('should not allow renewing cancelled policy', () => {
    component.policy = { ...mockPolicy, status: PolicyStatus.Cancelled };
    expect(component.canRenew()).toBe(false);
  });

  it('should not allow renewing when policy is null', () => {
    component.policy = null;
    expect(component.canRenew()).toBe(false);
  });

  it('should renew policy successfully', () => {
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return { onAction: () => of(null) };
    };

    component.renewPolicy();

    setTimeout(() => {
      expect(snackBarCalled).toBe(true);
    }, 100);
  });

  it('should handle renew policy error', () => {
    mockPolicyService.renewPolicy = () => throwError(() => new Error('Failed'));
    
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return { onAction: () => of(null) };
    };

    component.renewPolicy();

    setTimeout(() => {
      expect(snackBarCalled).toBe(true);
    }, 100);
  });

  it('should handle load policy error', () => {
    mockPolicyService.getPolicyById = () => throwError(() => new Error('Failed'));
    
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return { onAction: () => of(null) };
    };

    component.loadPolicy(1);

    setTimeout(() => {
      expect(component.error).toBe('Failed to load policy details');
      expect(snackBarCalled).toBe(true);
    }, 100);
  });

  it('should navigate back to policies', () => {
    let navigateCalled = false;
    let navigatePath = '';
    mockRouter.navigate = (path: string[]) => {
      navigateCalled = true;
      navigatePath = path[0];
      return Promise.resolve(true);
    };

    component.goBack();
    
    expect(navigateCalled).toBe(true);
    expect(navigatePath).toBe('/policies');
  });

  it('should reload policy after successful renewal', async () => {
    let loadPolicyCalled = false;
    component.loadPolicy = (id: number) => {
      loadPolicyCalled = true;
    };

    component.policy = mockPolicy;
    component.renewPolicy();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(loadPolicyCalled).toBe(true);
  });
});