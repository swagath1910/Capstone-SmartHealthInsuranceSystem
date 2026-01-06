import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoliciesComponent } from './policies';
import { PolicyService } from '../../services/policy.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { PolicyStatus } from '../../models/policy';
import { UserRole } from '../../../admin/models/user';

describe('PoliciesComponent', () => {
  let component: PoliciesComponent;
  let fixture: ComponentFixture<PoliciesComponent>;
  let mockPolicyService: any;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;

  const mockPolicies = [
    {
      policyId: 1,
      policyNumber: 'POL-001',
      userId: 1,
      userName: 'John Doe',
      planId: 1,
      planName: 'Basic Plan',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      premiumPaid: 5000,
      status: PolicyStatus.Active,
      autoRenew: true,
      renewedOn: undefined
    },
    {
      policyId: 2,
      policyNumber: 'POL-002',
      userId: 2,
      userName: 'Jane Smith',
      planId: 2,
      planName: 'Premium Plan',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      premiumPaid: 8000,
      status: PolicyStatus.Expired,
      autoRenew: false,
      renewedOn: undefined
    },
    {
      policyId: 3,
      policyNumber: 'POL-003',
      userId: 3,
      userName: 'Bob Johnson',
      planId: 1,
      planName: 'Basic Plan',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      premiumPaid: 5000,
      status: PolicyStatus.Suspended,
      autoRenew: true,
      renewedOn: undefined
    }
  ];

  const mockAdminUser = {
    userId: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: UserRole.Admin,
    firstName: 'Admin',
    lastName: 'User',
    dateOfBirth: new Date('1990-01-01'),
    phoneNumber: '1234567890',
    address: '123 Admin St',
    createdAt: new Date(),
    isActive: true
  };

  beforeEach(async () => {
    mockPolicyService = {
      getAllPolicies: () => of(mockPolicies),
      getMyPolicies: () => of([mockPolicies[0]]),
      renewPolicy: (id: number) => of(mockPolicies[0])
    };

    mockAuthService = {
      getCurrentUser: () => mockAdminUser
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
      imports: [PoliciesComponent, BrowserAnimationsModule],
      providers: [
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load policies on init', () => {
    expect(component.policies.length).toBe(3);
  });

  it('should show user column for admin', () => {
    expect(component.showUserColumn()).toBe(true);
  });

  it('should allow admin to create policy', () => {
    expect(component.canCreatePolicy()).toBe(true);
  });

  it('should allow admin to edit policy', () => {
    expect(component.canEditPolicy()).toBe(true);
  });

  it('should filter policies by search term', () => {
    component.searchTerm = 'POL-001';
    component.applyFilters();
    expect(component.filteredPolicies.length).toBe(1);
    expect(component.filteredPolicies[0].policyNumber).toBe('POL-001');
  });

  it('should filter policies by status', () => {
    component.selectedStatus = PolicyStatus.Active;
    component.applyFilters();
    expect(component.filteredPolicies.length).toBe(1);
    expect(component.filteredPolicies[0].status).toBe(PolicyStatus.Active);
  });

  it('should filter policies by auto-renew', () => {
    component.selectedAutoRenew = 'yes';
    component.applyFilters();
    expect(component.filteredPolicies.every(p => p.autoRenew)).toBe(true);
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.selectedStatus = PolicyStatus.Active;
    component.selectedAutoRenew = 'yes';
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.selectedStatus).toBe('');
    expect(component.selectedAutoRenew).toBe('');
  });

  it('should sort policies by policy number', () => {
    component.sortData({ active: 'policyNumber', direction: 'asc' });
    expect(component.filteredPolicies[0].policyNumber).toBe('POL-001');
  });

  it('should handle page change', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 30 });
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should update paginated policies', () => {
    component.pageSize = 2;
    component.updatePaginatedPolicies();
    expect(component.paginatedPolicies.length).toBe(2);
  });

  it('should get correct status color', () => {
    expect(component.getStatusColor(PolicyStatus.Active)).toBe('primary');
    expect(component.getStatusColor(PolicyStatus.Expired)).toBe('warn');
  });

  it('should get correct status text', () => {
    expect(component.getStatusText(PolicyStatus.Active)).toBe('Active');
    expect(component.getStatusText(PolicyStatus.Expired)).toBe('Expired');
  });

  it('should allow renewing active policy for admin', () => {
    expect(component.canRenewPolicy(mockPolicies[0])).toBe(true);
  });

  it('should navigate to create policy', () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };

    component.createPolicy();
    expect(navigateCalled).toBe(true);
  });

  it('should navigate to edit policy', () => {
    let navigateCalled = false;
    mockRouter.navigate = () => {
      navigateCalled = true;
      return Promise.resolve(true);
    };

    component.editPolicy(mockPolicies[0]);
    expect(navigateCalled).toBe(true);
  });

  it('should renew policy successfully', () => {
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return { onAction: () => of(null) };
    };

    component.renewPolicy(mockPolicies[0]);

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

    component.renewPolicy(mockPolicies[0]);

    setTimeout(() => {
      expect(snackBarCalled).toBe(true);
    }, 100);
  });

  it('should handle load policies error', () => {
    mockPolicyService.getAllPolicies = () => throwError(() => ({ status: 0 }));
    
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

  it('should not show user column for policy holder', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockAdminUser, role: UserRole.PolicyHolder });
    const newComponent = new PoliciesComponent(
      mockPolicyService,
      mockAuthService,
      mockRouter,
      mockSnackBar,
      { detectChanges: () => {} } as any
    );
    expect(newComponent.showUserColumn()).toBe(false);
  });
});
