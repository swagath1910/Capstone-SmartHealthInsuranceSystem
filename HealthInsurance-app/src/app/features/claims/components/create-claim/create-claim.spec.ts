import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateClaimComponent } from './create-claim';
import { ClaimService } from '../../services/claim.service';
import { PolicyService } from '../../../policies/services/policy.service';
import { HospitalService } from '../../../admin/services/hospital.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('CreateClaimComponent', () => {
  let component: CreateClaimComponent;
  let fixture: ComponentFixture<CreateClaimComponent>;
  let mockClaimService: any;
  let mockPolicyService: any;
  let mockHospitalService: any;
  let mockRouter: any;
  let mockSnackBar: any;
  let mockCdr: any;

  const mockPolicies = [
    { policyId: 1, policyNumber: 'POL-001', planName: 'Basic Plan' },
    { policyId: 2, policyNumber: 'POL-002', planName: 'Premium Plan' }
  ];

  const mockHospitals = [
    { hospitalId: 1, hospitalName: 'Test Hospital 1', address: '123 Main St' },
    { hospitalId: 2, hospitalName: 'Test Hospital 2', address: '456 Oak Ave' }
  ];

  beforeEach(async () => {
    mockClaimService = {
      createClaim: (data: any) => of({
        claimId: 1,
        claimNumber: 'CLM-001',
        ...data
      })
    };

    mockPolicyService = {
      getMyPolicies: () => of(mockPolicies)
    };

    mockHospitalService = {
      getAllHospitals: () => of(mockHospitals)
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
      imports: [CreateClaimComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: ClaimService, useValue: mockClaimService },
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: HospitalService, useValue: mockHospitalService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.claimForm.get('policyId')?.value).toBe('');
    expect(component.claimForm.get('hospitalId')?.value).toBe('');
    expect(component.claimForm.get('claimAmount')?.value).toBe('');
    expect(component.claimForm.get('notes')?.value).toBe('');
  });

  it('should load policies on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.policies.length).toBe(2);
  });

  it('should load hospitals on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.hospitals.length).toBe(2);
  });

  it('should validate required fields', () => {
    expect(component.claimForm.valid).toBe(false);
    
    component.claimForm.patchValue({
      policyId: 1,
      hospitalId: 1,
      claimAmount: 5000
    });
    
    expect(component.claimForm.valid).toBe(true);
  });

  it('should submit claim with valid data', async () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };

    component.claimForm.patchValue({
      policyId: 1,
      hospitalId: 1,
      claimAmount: 5000,
      notes: 'Test notes'
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(navigateCalled).toBe(true);
  });

  it('should handle claim creation error', async () => {
    mockClaimService.createClaim = () => throwError(() => new Error('Failed'));
    
    component.claimForm.patchValue({
      policyId: 1,
      hospitalId: 1,
      claimAmount: 5000
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.isLoading).toBe(false);
  });

  it('should navigate back when cancel is clicked', () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };

    component.cancel();
    expect(navigateCalled).toBe(true);
  });

  it('should validate minimum claim amount', () => {
    const claimAmountControl = component.claimForm.get('claimAmount');
    
    claimAmountControl?.setValue(-100);
    expect(claimAmountControl?.hasError('min')).toBe(true);
    
    claimAmountControl?.setValue(100);
    expect(claimAmountControl?.hasError('min')).toBe(false);
  });
});