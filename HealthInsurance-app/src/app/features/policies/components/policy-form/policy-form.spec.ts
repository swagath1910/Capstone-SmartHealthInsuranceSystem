import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyFormComponent } from './policy-form';
import { PolicyService } from '../../services/policy.service';
import { InsurancePlanService } from '../../../admin/services/insurance-plan.service';
import { UserService } from '../../../admin/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PolicyStatus } from '../../models/policy';

describe('PolicyFormComponent', () => {
  let component: PolicyFormComponent;
  let fixture: ComponentFixture<PolicyFormComponent>;
  let mockPolicyService: any;
  let mockInsurancePlanService: any;
  let mockUserService: any;
  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockSnackBar: any;
  let mockCdr: any;

  const mockInsurancePlans = [
    { planId: 1, planName: 'Basic Plan', coverageLimit: 100000 },
    { planId: 2, planName: 'Premium Plan', coverageLimit: 200000 }
  ];

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    dateOfBirth: new Date('1990-01-01'),
    role: 5, // PolicyHolder role
    isActive: true
  };

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
      createPolicy: (data: any) => of(mockPolicy),
      updatePolicy: (id: number, data: any) => of(mockPolicy),
      getPolicyById: (id: number) => of(mockPolicy)
    };

    mockInsurancePlanService = {
      getActivePlans: () => of(mockInsurancePlans)
    };

    mockUserService = {
      getAllUsers: () => of([mockUser])
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => null
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

    mockCdr = {
      detectChanges: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [PolicyFormComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: InsurancePlanService, useValue: mockInsurancePlanService },
        { provide: UserService, useValue: mockUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.policyForm.get('userId')?.value).toBe('');
    expect(component.policyForm.get('planId')?.value).toBe('');
  });

  it('should load insurance plans on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.insurancePlans.length).toBe(2);
  });

  it('should load policy holders on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.policyHolders.length).toBeGreaterThan(0);
  });

  it('should be in create mode by default', () => {
    expect(component.isEditMode).toBe(false);
  });

  it('should be in edit mode when policy ID is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get = () => '1';
    const editComponent = new PolicyFormComponent(
      component['fb'],
      mockActivatedRoute,
      mockRouter,
      mockPolicyService,
      mockInsurancePlanService,
      mockUserService,
      mockSnackBar,
      mockCdr
    );
    editComponent.ngOnInit();
    expect(editComponent.isEditMode).toBe(true);
  });

  it('should validate required fields', () => {
    expect(component.policyForm.valid).toBe(false);
    
    component.policyForm.patchValue({
      userId: 1,
      planId: 1,
      startDate: new Date(),
      endDate: new Date(),
      premiumPaid: 5000,
      status: '0',
      autoRenew: true
    });
    
    expect(component.policyForm.valid).toBe(true);
  });

  it('should validate userId minimum', () => {
    const userIdControl = component.policyForm.get('userId');
    userIdControl?.setValue(0);
    expect(userIdControl?.hasError('min')).toBe(true);
    
    userIdControl?.setValue(1);
    expect(userIdControl?.hasError('min')).toBe(false);
  });

  it('should validate premium amount minimum', () => {
    const premiumControl = component.policyForm.get('premiumPaid');
    premiumControl?.setValue(0);
    expect(premiumControl?.hasError('min')).toBe(true);
    
    premiumControl?.setValue(100);
    expect(premiumControl?.hasError('min')).toBe(false);
  });

  it('should create policy with valid data', async () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };

    component.policyForm.patchValue({
      userId: 1,
      planId: 1,
      startDate: new Date(),
      endDate: new Date(),
      premiumPaid: 5000,
      status: '0',
      autoRenew: true
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(navigateCalled).toBe(true);
  });

  it('should show error when submitting invalid form', () => {
    component.policyForm.patchValue({
      userId: '', // Invalid - required
      planId: 1,
      startDate: new Date(),
      endDate: new Date(),
      premiumPaid: 5000,
      status: '0'
    });

    component.onSubmit();
    expect(component.isSubmitting).toBe(false);
  });

  it('should handle create policy error', async () => {
    mockPolicyService.createPolicy = () => throwError(() => new Error('Failed'));
    
    component.policyForm.patchValue({
      userId: 1,
      planId: 1,
      startDate: new Date(),
      endDate: new Date(),
      premiumPaid: 5000,
      status: '0'
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.isSubmitting).toBe(false);
  });

  it('should navigate back when cancel is clicked', () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };

    component.goBack();
    expect(navigateCalled).toBe(true);
  });

  it('should handle load insurance plans error', () => {
    mockInsurancePlanService.getActivePlans = () => throwError(() => new Error('Failed'));
    component.loadInsurancePlans();
    expect(component.insurancePlans.length).toBe(0);
  });

  it('should handle load policy holders error', () => {
    mockUserService.getAllUsers = () => throwError(() => new Error('Failed'));
    component.loadPolicyHolders();
    expect(component.policyHolders.length).toBe(0);
  });
});