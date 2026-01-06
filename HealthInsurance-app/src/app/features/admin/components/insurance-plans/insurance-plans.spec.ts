import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsurancePlansComponent } from './insurance-plans';
import { InsurancePlanService } from '../../services/insurance-plan.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { UserRole } from '../../models/user';
import { PlanType } from '../../models/insurance-plan';

describe('InsurancePlansComponent', () => {
  let component: InsurancePlansComponent;
  let fixture: ComponentFixture<InsurancePlansComponent>;
  let mockPlanService: any;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;

  const mockPlans = [
    {
      planId: 1,
      planName: 'Basic Health Plan',
      planType: PlanType.Individual,
      description: 'Basic coverage',
      premiumAmount: 100,
      coverageLimit: 50000,
      durationInMonths: 12,
      deductiblePercentage: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      planId: 2,
      planName: 'Premium Health Plan',
      planType: PlanType.Family,
      description: 'Premium coverage',
      premiumAmount: 200,
      coverageLimit: 100000,
      durationInMonths: 12,
      deductiblePercentage: 5,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockUser = {
    userId: 1,
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.Admin,
    dateOfBirth: new Date(),
    isActive: true
  };

  beforeEach(async () => {
    mockPlanService = {
      getAllPlans: () => of(mockPlans)
    };

    mockAuthService = {
      getCurrentUser: () => mockUser
    };

    mockRouter = {
      navigate: () => Promise.resolve(true)
    };

    mockSnackBar = {
      open: () => ({})
    };

    await TestBed.configureTestingModule({
      imports: [InsurancePlansComponent, BrowserAnimationsModule],
      providers: [
        { provide: InsurancePlanService, useValue: mockPlanService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InsurancePlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load plans on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.plans.length).toBe(2);
    expect(component.filteredPlans.length).toBe(2);
  });

  it('should check if user can manage plans (Admin)', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.Admin });
    expect(component.canManagePlans()).toBe(true);
  });

  it('should check if user can manage plans (InsuranceAgent)', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.InsuranceAgent });
    expect(component.canManagePlans()).toBe(true);
  });

  it('should check if user cannot manage plans (PolicyHolder)', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.PolicyHolder });
    expect(component.canManagePlans()).toBe(false);
  });

  it('should navigate to create plan', () => {
    let navigateCalled = false;
    mockRouter.navigate = (route: any[]) => {
      navigateCalled = true;
      expect(route).toEqual(['/insurance-plans/create']);
      return Promise.resolve(true);
    };

    component.createPlan();
    expect(navigateCalled).toBe(true);
  });

  it('should navigate to edit plan', () => {
    let navigateCalled = false;
    mockRouter.navigate = (route: any[]) => {
      navigateCalled = true;
      expect(route).toEqual(['/insurance-plans/edit', 1]);
      return Promise.resolve(true);
    };

    component.editPlan(mockPlans[0]);
    expect(navigateCalled).toBe(true);
  });

  it('should filter plans by search term', () => {
    component.plans = mockPlans;
    component.searchTerm = 'basic';
    component.applyFilters();

    expect(component.filteredPlans.length).toBe(1);
    expect(component.filteredPlans[0].planName).toBe('Basic Health Plan');
  });

  it('should filter plans by status (active)', () => {
    component.plans = mockPlans;
    component.selectedStatus = 'active';
    component.applyFilters();

    expect(component.filteredPlans.length).toBe(1);
    expect(component.filteredPlans[0].isActive).toBe(true);
  });

  it('should filter plans by status (inactive)', () => {
    component.plans = mockPlans;
    component.selectedStatus = 'inactive';
    component.applyFilters();

    expect(component.filteredPlans.length).toBe(1);
    expect(component.filteredPlans[0].isActive).toBe(false);
  });

  it('should clear all filters', () => {
    component.plans = mockPlans;
    component.searchTerm = 'basic';
    component.selectedStatus = 'active';
    component.applyFilters();

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedStatus).toBe('');
    expect(component.filteredPlans.length).toBe(2);
  });

  it('should sort plans by name ascending', () => {
    component.plans = mockPlans;
    component.filteredPlans = mockPlans.slice();

    component.sortData({ active: 'planName', direction: 'asc' });

    expect(component.filteredPlans[0].planName).toBe('Basic Health Plan');
    expect(component.filteredPlans[1].planName).toBe('Premium Health Plan');
  });

  it('should sort plans by name descending', () => {
    component.plans = mockPlans;
    component.filteredPlans = mockPlans.slice();

    component.sortData({ active: 'planName', direction: 'desc' });

    expect(component.filteredPlans[0].planName).toBe('Premium Health Plan');
    expect(component.filteredPlans[1].planName).toBe('Basic Health Plan');
  });

  it('should sort plans by premium amount', () => {
    component.plans = mockPlans;
    component.filteredPlans = mockPlans.slice();

    component.sortData({ active: 'premiumAmount', direction: 'asc' });

    expect(component.filteredPlans[0].premiumAmount).toBe(100);
    expect(component.filteredPlans[1].premiumAmount).toBe(200);
  });

  it('should sort plans by coverage limit', () => {
    component.plans = mockPlans;
    component.filteredPlans = mockPlans.slice();

    component.sortData({ active: 'coverageLimit', direction: 'desc' });

    expect(component.filteredPlans[0].coverageLimit).toBe(100000);
    expect(component.filteredPlans[1].coverageLimit).toBe(50000);
  });

  it('should update pagination on page change', () => {
    component.plans = mockPlans;
    component.filteredPlans = mockPlans;
    component.pageSize = 10;
    component.pageIndex = 0;

    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 10 });

    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(5);
  });

  it('should update paginated plans', () => {
    component.filteredPlans = mockPlans;
    component.pageSize = 1;
    component.pageIndex = 0;

    component.updatePaginatedPlans();

    expect(component.paginatedPlans.length).toBe(1);
    expect(component.paginatedPlans[0].planId).toBe(1);
  });

  it('should handle error when loading plans', async () => {
    mockPlanService.getAllPlans = () => throwError(() => new Error('Load failed'));
    
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return {};
    };

    component.ngOnInit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(snackBarCalled).toBe(true);
  });

  it('should reset page index when applying filters', () => {
    component.plans = mockPlans;
    component.pageIndex = 2;
    component.searchTerm = 'basic';

    component.applyFilters();

    expect(component.pageIndex).toBe(0);
  });

  it('should filter by description in search', () => {
    component.plans = mockPlans;
    component.searchTerm = 'premium coverage';
    component.applyFilters();

    expect(component.filteredPlans.length).toBe(1);
    expect(component.filteredPlans[0].description).toBe('Premium coverage');
  });

  it('should set displayed columns with actions for admin', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.Admin });
    component.setDisplayedColumns();

    expect(component.displayedColumns).toContain('actions');
  });

  it('should set displayed columns without actions for policy holder', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.PolicyHolder });
    component.setDisplayedColumns();

    expect(component.displayedColumns).not.toContain('actions');
  });
});
