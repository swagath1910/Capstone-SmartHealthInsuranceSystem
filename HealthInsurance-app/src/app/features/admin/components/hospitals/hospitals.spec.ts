import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HospitalsComponent } from './hospitals';
import { HospitalService } from '../../services/hospital.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { UserRole } from '../../models/user';

describe('HospitalsComponent', () => {
  let component: HospitalsComponent;
  let fixture: ComponentFixture<HospitalsComponent>;
  let mockHospitalService: any;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;

  const mockHospitals = [
    {
      hospitalId: 1,
      hospitalName: 'City Hospital',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phoneNumber: '555-1234',
      email: 'info@cityhospital.com',
      isNetworkProvider: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      hospitalId: 2,
      hospitalName: 'County Medical Center',
      address: '456 Oak Ave',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      phoneNumber: '555-5678',
      email: 'info@countymedical.com',
      isNetworkProvider: false,
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
    mockHospitalService = {
      getAllHospitals: () => of(mockHospitals)
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
      imports: [HospitalsComponent, BrowserAnimationsModule],
      providers: [
        { provide: HospitalService, useValue: mockHospitalService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HospitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hospitals on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.hospitals.length).toBe(2);
    expect(component.filteredHospitals.length).toBe(2);
  });

  it('should check if user can manage hospitals (Admin)', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.Admin });
    expect(component.canManageHospitals()).toBe(true);
  });

  it('should check if user can manage hospitals (HospitalProvider)', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.HospitalStaff });
    expect(component.canManageHospitals()).toBe(true);
  });

  it('should check if user cannot manage hospitals (PolicyHolder)', () => {
    mockAuthService.getCurrentUser = () => ({ ...mockUser, role: UserRole.PolicyHolder });
    expect(component.canManageHospitals()).toBe(false);
  });

  it('should navigate to create hospital', () => {
    let navigateCalled = false;
    mockRouter.navigate = (route: any[]) => {
      navigateCalled = true;
      expect(route).toEqual(['/hospitals/create']);
      return Promise.resolve(true);
    };

    component.createHospital();
    expect(navigateCalled).toBe(true);
  });

  it('should navigate to edit hospital', () => {
    let navigateCalled = false;
    mockRouter.navigate = (route: any[]) => {
      navigateCalled = true;
      expect(route).toEqual(['/hospitals/edit', 1]);
      return Promise.resolve(true);
    };

    component.editHospital(mockHospitals[0]);
    expect(navigateCalled).toBe(true);
  });

  it('should filter hospitals by search term', () => {
    component.hospitals = mockHospitals;
    component.searchTerm = 'city';
    component.applyFilters();

    expect(component.filteredHospitals.length).toBe(1);
    expect(component.filteredHospitals[0].hospitalName).toBe('City Hospital');
  });

  it('should filter hospitals by network status (network)', () => {
    component.hospitals = mockHospitals;
    component.selectedNetworkStatus = 'network';
    component.applyFilters();

    expect(component.filteredHospitals.length).toBe(1);
    expect(component.filteredHospitals[0].isNetworkProvider).toBe(true);
  });

  it('should filter hospitals by network status (non-network)', () => {
    component.hospitals = mockHospitals;
    component.selectedNetworkStatus = 'non-network';
    component.applyFilters();

    expect(component.filteredHospitals.length).toBe(1);
    expect(component.filteredHospitals[0].isNetworkProvider).toBe(false);
  });

  it('should clear all filters', () => {
    component.hospitals = mockHospitals;
    component.searchTerm = 'city';
    component.selectedNetworkStatus = 'network';
    component.applyFilters();

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedNetworkStatus).toBe('');
    expect(component.filteredHospitals.length).toBe(2);
  });

  it('should sort hospitals by name ascending', () => {
    component.hospitals = mockHospitals;
    component.filteredHospitals = mockHospitals.slice();

    component.sortData({ active: 'hospitalName', direction: 'asc' });

    expect(component.filteredHospitals[0].hospitalName).toBe('City Hospital');
    expect(component.filteredHospitals[1].hospitalName).toBe('County Medical Center');
  });

  it('should sort hospitals by name descending', () => {
    component.hospitals = mockHospitals;
    component.filteredHospitals = mockHospitals.slice();

    component.sortData({ active: 'hospitalName', direction: 'desc' });

    expect(component.filteredHospitals[0].hospitalName).toBe('County Medical Center');
    expect(component.filteredHospitals[1].hospitalName).toBe('City Hospital');
  });

  it('should sort hospitals by city', () => {
    component.hospitals = mockHospitals;
    component.filteredHospitals = mockHospitals.slice();

    component.sortData({ active: 'city', direction: 'asc' });

    expect(component.filteredHospitals[0].city).toBe('Boston');
    expect(component.filteredHospitals[1].city).toBe('New York');
  });

  it('should update pagination on page change', () => {
    component.hospitals = mockHospitals;
    component.filteredHospitals = mockHospitals;
    component.pageSize = 10;
    component.pageIndex = 0;

    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 10 });

    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(5);
  });

  it('should update paginated hospitals', () => {
    component.filteredHospitals = mockHospitals;
    component.pageSize = 1;
    component.pageIndex = 0;

    component.updatePaginatedHospitals();

    expect(component.paginatedHospitals.length).toBe(1);
    expect(component.paginatedHospitals[0].hospitalId).toBe(1);
  });

  it('should handle error when loading hospitals', async () => {
    mockHospitalService.getAllHospitals = () => throwError(() => new Error('Load failed'));
    
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
    component.hospitals = mockHospitals;
    component.pageIndex = 2;
    component.searchTerm = 'city';

    component.applyFilters();

    expect(component.pageIndex).toBe(0);
  });

  it('should filter by city in search', () => {
    component.hospitals = mockHospitals;
    component.searchTerm = 'boston';
    component.applyFilters();

    expect(component.filteredHospitals.length).toBe(1);
    expect(component.filteredHospitals[0].city).toBe('Boston');
  });

  it('should filter by phone number in search', () => {
    component.hospitals = mockHospitals;
    component.searchTerm = '555-1234';
    component.applyFilters();

    expect(component.filteredHospitals.length).toBe(1);
    expect(component.filteredHospitals[0].phoneNumber).toBe('555-1234');
  });
});
