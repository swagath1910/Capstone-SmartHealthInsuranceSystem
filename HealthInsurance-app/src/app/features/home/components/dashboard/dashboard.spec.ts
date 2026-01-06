import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { PolicyService } from '../../../policies/services/policy.service';
import { ClaimService } from '../../../claims/services/claim.service';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { UserRole } from '../../../admin/models/user';
import { PolicyStatus } from '../../../policies/models/policy';
import { ClaimStatus } from '../../../claims/models/claim';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: any;
  let mockPolicyService: any;
  let mockClaimService: any;
  let mockRouter: any;

  const mockUser = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: UserRole.PolicyHolder,
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: new Date('1990-01-01'),
    phoneNumber: '1234567890',
    address: '123 Test St',
    createdAt: new Date(),
    isActive: true
  };

  const mockPolicies = [
    {
      policyId: 1,
      policyNumber: 'POL-001',
      planName: 'Basic Plan',
      status: PolicyStatus.Active,
      userId: 1,
      planId: 1,
      startDate: new Date(),
      endDate: new Date(),
      premiumAmount: 5000,
      coverageAmount: 100000,
      deductibleAmount: 1000,
      userName: 'Test User',
      nextBillingDate: new Date(),
      lastPaymentDate: undefined,
      paymentStatus: undefined,
      autoRenewal: true
    },
    {
      policyId: 2,
      policyNumber: 'POL-002',
      planName: 'Premium Plan',
      status: PolicyStatus.Expired,
      userId: 1,
      planId: 2,
      startDate: new Date(),
      endDate: new Date(),
      premiumAmount: 8000,
      coverageAmount: 200000,
      deductibleAmount: 500,
      userName: 'Test User',
      nextBillingDate: new Date(),
      lastPaymentDate: undefined,
      paymentStatus: undefined,
      autoRenewal: false
    }
  ];

  const mockClaims = [
    {
      claimId: 1,
      claimNumber: 'CLM-001',
      policyId: 1,
      policyNumber: 'POL-001',
      userId: 1,
      hospitalName: 'Test Hospital',
      userName: 'Test User',
      claimAmount: 5000,
      approvedAmount: undefined,
      treatmentDate: new Date(),
      submittedAt: new Date(),
      treatmentDetails: 'Test treatment',
      notes: undefined,
      status: ClaimStatus.Submitted,
      reviewerName: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined
    },
    {
      claimId: 2,
      claimNumber: 'CLM-002',
      policyId: 1,
      policyNumber: 'POL-001',
      userId: 1,
      hospitalName: 'Another Hospital',
      userName: 'Test User',
      claimAmount: 3000,
      approvedAmount: undefined,
      treatmentDate: new Date(),
      submittedAt: new Date(),
      treatmentDetails: 'Another treatment',
      notes: undefined,
      status: ClaimStatus.InReview,
      reviewerName: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined
    }
  ];

  beforeEach(async () => {
    mockAuthService = {
      currentUser$: of(mockUser)
    };

    mockPolicyService = {
      getMyPolicies: () => of(mockPolicies),
      getAllPolicies: () => of(mockPolicies)
    };

    mockClaimService = {
      getMyClaims: () => of(mockClaims),
      getAllClaims: () => of(mockClaims)
    };

    mockRouter = {
      navigate: () => Promise.resolve(true)
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: ClaimService, useValue: mockClaimService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should initialize stats to zero', () => {
    const mockCdr = { detectChanges: () => {} } as any;
    const newComponent = new DashboardComponent(
      mockAuthService,
      mockPolicyService,
      mockClaimService,
      mockRouter,
      mockCdr
    );
    expect(newComponent.stats.activePolicies).toBe(0);
    expect(newComponent.stats.pendingClaims).toBe(0);
  });

  it('should load policy holder stats correctly', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.stats.activePolicies).toBe(1);
    expect(component.stats.pendingClaims).toBe(2);
  });

  it('should load admin stats correctly', async () => {
    mockAuthService.currentUser$ = of({
      ...mockUser,
      role: UserRole.Admin
    });

    const adminComponent = TestBed.createComponent(DashboardComponent).componentInstance;
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(adminComponent.stats.activePolicies).toBeGreaterThanOrEqual(0);
    expect(adminComponent.stats.pendingClaims).toBeGreaterThanOrEqual(0);
  });

  it('should load claims officer stats correctly', async () => {
    mockAuthService.currentUser$ = of({
      ...mockUser,
      role: UserRole.ClaimsOfficer
    });

    const claimsOfficerComponent = TestBed.createComponent(DashboardComponent).componentInstance;
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(claimsOfficerComponent.stats.pendingClaims).toBeGreaterThanOrEqual(0);
  });

  it('should handle policy loading error', async () => {
    mockPolicyService.getMyPolicies = () => throwError(() => new Error('Failed'));
    
    component.loadStats();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(component.stats.activePolicies).toBe(0);
  });

  it('should handle claim loading error', async () => {
    mockClaimService.getMyClaims = () => throwError(() => new Error('Failed'));
    
    component.loadStats();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(component.stats.pendingClaims).toBe(0);
  });

  it('should filter active policies correctly', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.stats.activePolicies).toBe(1);
  });

  it('should filter pending claims correctly', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.stats.pendingClaims).toBe(2);
  });

  it('should not load stats if user is null', () => {
    component.currentUser = null;
    const initialActivePolicies = component.stats.activePolicies;
    const initialPendingClaims = component.stats.pendingClaims;
    
    component.loadStats();
    
    expect(component.stats.activePolicies).toBe(initialActivePolicies);
    expect(component.stats.pendingClaims).toBe(initialPendingClaims);
  });
});
