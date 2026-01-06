import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimDetailComponent } from './claim-detail';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ClaimStatus } from '../../models/claim';
import { UserRole } from '../../../admin/models/user';

describe('ClaimDetailComponent', () => {
  let component: ClaimDetailComponent;
  let fixture: ComponentFixture<ClaimDetailComponent>;
  let mockClaimService: any;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;
  let mockActivatedRoute: any;

  const mockClaim = {
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
  };

  beforeEach(async () => {
    mockClaimService = {
      getClaimById: (id: number) => of(mockClaim),
      reviewClaim: (id: number, data: any) => of({ ...mockClaim, status: ClaimStatus.Approved })
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

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => '1'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ClaimDetailComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: ClaimService, useValue: mockClaimService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load claim on init', () => {
    expect(component.claim).toBeTruthy();
    expect(component.claim?.claimNumber).toBe('CLM-001');
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass(ClaimStatus.Submitted)).toBe('status-submitted');
    expect(component.getStatusClass(ClaimStatus.Approved)).toBe('status-approved');
    expect(component.getStatusClass(ClaimStatus.Rejected)).toBe('status-rejected');
  });

  it('should allow claims officer to review', () => {
    component.claim = mockClaim;
    component.currentUserRole = UserRole.ClaimsOfficer;
    expect(component.canReview()).toBe(true);
  });

  it('should not allow policy holder to review', () => {
    component.claim = mockClaim;
    component.currentUserRole = UserRole.PolicyHolder;
    expect(component.canReview()).toBe(false);
  });

  it('should show review form when startReview is called', () => {
    component.showReviewForm = false;
    component.startReview();
    expect(component.showReviewForm).toBe(true);
  });

  it('should hide review form when cancelReview is called', () => {
    component.showReviewForm = true;
    component.cancelReview();
    expect(component.showReviewForm).toBe(false);
  });

  it('should submit review with valid data', () => {
    component.claim = mockClaim;
    component.reviewForm.patchValue({
      status: ClaimStatus.Approved,
      approvedAmount: 4500,
      rejectionReason: ''
    });

    component.submitReview();

    expect(component.showReviewForm).toBe(false);
  });

  it('should handle claim loading error', () => {
    mockClaimService.getClaimById = () => throwError(() => ({ status: 404 }));
    component.loadClaim(999);
    
    setTimeout(() => {
      expect(component.error).toBeTruthy();
    }, 100);
  });

  it('should navigate back when goBack is called', () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };
    component.goBack();
    expect(navigateCalled).toBe(true);
  });
});
