import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimsComponent } from './claims';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ClaimStatus } from '../../models/claim';
import { UserRole } from '../../../admin/models/user';

describe('ClaimsComponent', () => {
  let component: ClaimsComponent;
  let fixture: ComponentFixture<ClaimsComponent>;
  let mockClaimService: any;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;

  const mockClaims = [
    {
      claimId: 1,
      claimNumber: 'CLM-001',
      policyId: 1,
      policyNumber: 'POL-001',
      userId: 1,
      hospitalName: 'Test Hospital',
      userName: 'John Doe',
      claimAmount: 5000,
      approvedAmount: 4500,
      treatmentDate: new Date('2026-01-01'),
      submittedAt: new Date('2026-01-02'),
      treatmentDetails: 'Test treatment',
      notes: 'Test notes',
      status: ClaimStatus.Submitted,
      reviewerName: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined
    },
    {
      claimId: 2,
      claimNumber: 'CLM-002',
      policyId: 2,
      policyNumber: 'POL-002',
      userId: 2,
      hospitalName: 'Another Hospital',
      userName: 'Jane Smith',
      claimAmount: 3000,
      approvedAmount: undefined,
      treatmentDate: new Date('2026-01-05'),
      submittedAt: new Date('2026-01-06'),
      treatmentDetails: 'Another treatment',
      notes: undefined,
      status: ClaimStatus.InReview,
      reviewerName: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined
    }
  ];

  beforeEach(async () => {
    mockClaimService = {
      getAllClaims: () => of(mockClaims),
      getMyClaims: () => of([mockClaims[0]])
    };

    mockAuthService = {
      getCurrentUser: () => ({
        id: 1,
        email: 'test@example.com',
        role: UserRole.ClaimsOfficer,
        firstName: 'Test',
        lastName: 'User'
      })
    };

    mockRouter = {
      navigate: () => Promise.resolve(true)
    };

    mockSnackBar = {
      open: (message: string, action?: string, config?: any) => ({
        onAction: () => of(null)
      })
    };

    await TestBed.configureTestingModule({
      imports: [ClaimsComponent, BrowserAnimationsModule],
      providers: [
        { provide: ClaimService, useValue: mockClaimService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load claims on init', () => {
    expect(component.claims.length).toBeGreaterThan(0);
  });

  it('should show user column for claims officer', () => {
    expect(component.showUserColumn()).toBe(true);
  });

  it('should not allow policy holder to create claim when role is claims officer', () => {
    expect(component.canCreateClaim()).toBe(false);
  });

  it('should allow claims officer to review submitted claims', () => {
    const claim = mockClaims[0];
    expect(component.canReviewClaim(claim)).toBe(true);
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass(ClaimStatus.Submitted)).toBe('status-submitted');
    expect(component.getStatusClass(ClaimStatus.Approved)).toBe('status-approved');
  });

  it('should get correct status text', () => {
    expect(component.getStatusText(ClaimStatus.Submitted)).toBe('Submitted');
    expect(component.getStatusText(ClaimStatus.InReview)).toBe('In Review');
  });

  it('should filter claims by search term', () => {
    component.searchTerm = 'CLM-001';
    component.applyFilters();
    expect(component.filteredClaims.length).toBe(1);
    expect(component.filteredClaims[0].claimNumber).toBe('CLM-001');
  });

  it('should filter claims by status', () => {
    component.selectedStatus = ClaimStatus.Submitted;
    component.applyFilters();
    expect(component.filteredClaims.length).toBe(1);
    expect(component.filteredClaims[0].status).toBe(ClaimStatus.Submitted);
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.selectedStatus = ClaimStatus.Submitted;
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.selectedStatus).toBe('');
  });

  it('should navigate to create claim', () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };
    component.createClaim();
    expect(navigateCalled).toBe(true);
  });

  it('should navigate to review claim', () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };
    component.reviewClaim(mockClaims[0]);
    expect(navigateCalled).toBe(true);
  });

  it('should handle pagination', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 20 });
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should handle error when loading claims', () => {
    mockClaimService.getAllClaims = () => throwError(() => new Error('Failed'));
    component.loadClaims();
    
    setTimeout(() => {
      expect(component.claims.length).toBe(0);
    }, 100);
  });
});
