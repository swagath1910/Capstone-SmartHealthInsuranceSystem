import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports';
import { ReportsService } from '../../services/reports.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let mockReportsService: any;

  const mockPoliciesData = [
    { planType: 'Basic Plan', status: 'Active', count: 10, totalPremium: 50000 },
    { planType: 'Premium Plan', status: 'Active', count: 5, totalPremium: 40000 }
  ];

  const mockClaimsStatusData = [
    { status: 'Submitted', count: 15, totalAmount: 75000, averageAmount: 5000, approvedAmount: 0 },
    { status: 'Approved', count: 10, totalAmount: 50000, averageAmount: 5000, approvedAmount: 45000 }
  ];

  const mockClaimsHospitalData = [
    {
      hospitalName: 'City Hospital',
      city: 'New York',
      claimCount: 20,
      totalAmount: 100000,
      averageAmount: 5000,
      approvedClaims: 15,
      pendingClaims: 5
    }
  ];

  const mockPremiumPayoutData = [
    {
      month: 'January 2026',
      totalPremiums: 100000,
      totalPayouts: 60000,
      netBalance: 40000,
      payoutRatio: 60
    }
  ];

  const mockHighValueClaimsData = [
    {
      claimId: 1,
      policyNumber: 'POL-001',
      patientName: 'John Doe',
      hospitalName: 'City Hospital',
      claimAmount: 75000,
      approvedAmount: 70000,
      status: 'Approved',
      processingDays: 5
    }
  ];

  beforeEach(async () => {
    mockReportsService = {
      getPoliciesByTypeAndStatus: () => of(mockPoliciesData),
      getClaimsByStatusAndAmount: () => of(mockClaimsStatusData),
      getClaimsByHospitalDetailed: () => of(mockClaimsHospitalData),
      getPremiumVsPayoutReport: () => of(mockPremiumPayoutData),
      getHighValueClaims: (threshold: number) => of(mockHighValueClaimsData)
    };

    await TestBed.configureTestingModule({
      imports: [ReportsComponent, BrowserAnimationsModule],
      providers: [
        { provide: ReportsService, useValue: mockReportsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load policies by type and status on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.policiesData.length).toBe(2);
  });

  it('should load claims by status on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.claimsStatusData.length).toBe(2);
  });

  it('should load claims by hospital on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.claimsHospitalData.length).toBe(1);
  });

  it('should load premium vs payout data on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.premiumPayoutData.length).toBe(1);
  });

  it('should load high value claims on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.highValueClaimsData.length).toBe(1);
  });

  it('should have correct columns for policies table', () => {
    expect(component.policiesColumns).toContain('planType');
    expect(component.policiesColumns).toContain('status');
    expect(component.policiesColumns).toContain('count');
    expect(component.policiesColumns).toContain('totalPremium');
  });

  it('should have correct columns for claims status table', () => {
    expect(component.claimsStatusColumns).toContain('status');
    expect(component.claimsStatusColumns).toContain('count');
    expect(component.claimsStatusColumns).toContain('totalAmount');
  });

  it('should have correct columns for claims hospital table', () => {
    expect(component.claimsHospitalColumns).toContain('hospitalName');
    expect(component.claimsHospitalColumns).toContain('city');
    expect(component.claimsHospitalColumns).toContain('claimCount');
  });

  it('should have correct columns for premium payout table', () => {
    expect(component.premiumPayoutColumns).toContain('month');
    expect(component.premiumPayoutColumns).toContain('totalPremiums');
    expect(component.premiumPayoutColumns).toContain('totalPayouts');
  });

  it('should have correct columns for high value claims table', () => {
    expect(component.highValueClaimsColumns).toContain('claimId');
    expect(component.highValueClaimsColumns).toContain('policyNumber');
    expect(component.highValueClaimsColumns).toContain('claimAmount');
  });

  it('should handle error when loading policies', () => {
    mockReportsService.getPoliciesByTypeAndStatus = () => throwError(() => new Error('Failed'));
    component.loadPoliciesByTypeStatus();
    expect(component.loadingPolicies).toBe(false);
  });

  it('should handle error when loading claims by status', () => {
    mockReportsService.getClaimsByStatusAndAmount = () => throwError(() => new Error('Failed'));
    component.loadClaimsAnalysis();
    expect(component.loadingClaims).toBe(false);
  });

  it('should handle error when loading claims by hospital', () => {
    mockReportsService.getClaimsByHospitalDetailed = () => throwError(() => new Error('Failed'));
    component.loadClaimsAnalysis();
    expect(component.loadingClaims).toBe(false);
  });

  it('should handle error when loading premium vs payout', () => {
    mockReportsService.getPremiumVsPayoutReport = () => throwError(() => new Error('Failed'));
    component.loadPremiumVsPayout();
    expect(component.loadingPremiumPayout).toBe(false);
  });

  it('should handle error when loading high value claims', () => {
    mockReportsService.getHighValueClaims = () => throwError(() => new Error('Failed'));
    component.loadHighValueClaims();
    expect(component.loadingHighValueClaims).toBe(false);
  });

  it('should set loading flags correctly', () => {
    expect(component.loadingPolicies).toBe(false);
    expect(component.loadingClaims).toBe(false);
    expect(component.loadingPremiumPayout).toBe(false);
    expect(component.loadingHighValueClaims).toBe(false);
  });

  it('should call getHighValueClaims with correct threshold', () => {
    let calledThreshold = 0;
    mockReportsService.getHighValueClaims = (threshold: number) => {
      calledThreshold = threshold;
      return of(mockHighValueClaimsData);
    };

    component.loadHighValueClaims();
    expect(calledThreshold).toBe(50000);
  });
});
