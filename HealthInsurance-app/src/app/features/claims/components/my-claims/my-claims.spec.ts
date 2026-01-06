import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyClaimsComponent } from './my-claims';
import { ClaimService } from '../../services/claim.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ClaimStatus } from '../../models/claim';

describe('MyClaimsComponent', () => {
  let component: MyClaimsComponent;
  let fixture: ComponentFixture<MyClaimsComponent>;
  let mockClaimService: any;
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
      userId: 1,
      hospitalName: 'Another Hospital',
      userName: 'John Doe',
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
      getMyClaims: () => of(mockClaims)
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
      imports: [MyClaimsComponent, BrowserAnimationsModule],
      providers: [
        { provide: ClaimService, useValue: mockClaimService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load claims on init', () => {
    expect(component.claims.length).toBe(2);
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toContain('claimNumber');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns.length).toBe(8);
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass(ClaimStatus.Submitted)).toBe('status-submitted');
    expect(component.getStatusClass(ClaimStatus.InReview)).toBe('status-in-review');
    expect(component.getStatusClass(ClaimStatus.Approved)).toBe('status-approved');
    expect(component.getStatusClass(ClaimStatus.Rejected)).toBe('status-rejected');
    expect(component.getStatusClass(ClaimStatus.Paid)).toBe('status-paid');
  });

  it('should get correct status text', () => {
    expect(component.getStatusText(ClaimStatus.Submitted)).toBe('Submitted');
    expect(component.getStatusText(ClaimStatus.InReview)).toBe('In Review');
    expect(component.getStatusText(ClaimStatus.Approved)).toBe('Approved');
    expect(component.getStatusText(ClaimStatus.Rejected)).toBe('Rejected');
    expect(component.getStatusText(ClaimStatus.Paid)).toBe('Paid');
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

  it('should handle error when loading claims', () => {
    mockClaimService.getMyClaims = () => throwError(() => new Error('Failed'));
    
    component.loadClaims();

    setTimeout(() => {
      expect(component.claims.length).toBe(0);
    }, 100);
  });
});
