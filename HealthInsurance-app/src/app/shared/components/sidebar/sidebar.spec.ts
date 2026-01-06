import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { UserRole } from '../../../features/admin/models/user';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    mockAuthService = {
      currentUser$: of(null)
    };

    mockRouter = {
      events: routerEventsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with collapsed set to false', () => {
    expect(component.isCollapsed).toBe(false);
  });

  it('should update navItems when user is null', () => {
    component.currentUser = null;
    component.updateNavItems();
    expect(component.navItems.length).toBe(0);
  });

  it('should filter navItems based on user role', () => {
    component.currentUser = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: UserRole.Admin,
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Test St',
      isActive: true
    };
    component.updateNavItems();
    expect(component.navItems.length).toBeGreaterThan(0);
  });

  it('should return correct role text', () => {
    expect(component.getRoleText(UserRole.Admin)).toBe('Admin');
    expect(component.getRoleText(UserRole.InsuranceAgent)).toBe('InsuranceAgent');
    expect(component.getRoleText(UserRole.ClaimsOfficer)).toBe('ClaimsOfficer');
    expect(component.getRoleText(UserRole.HospitalProvider)).toBe('HospitalProvider');
    expect(component.getRoleText(UserRole.PolicyHolder)).toBe('PolicyHolder');
  });

  it('should return correct role display text', () => {
    expect(component.getRoleDisplayText(UserRole.Admin)).toBe('Admin');
    expect(component.getRoleDisplayText(UserRole.InsuranceAgent)).toBe('Insurance Agent');
    expect(component.getRoleDisplayText(UserRole.ClaimsOfficer)).toBe('Claims Officer');
    expect(component.getRoleDisplayText(UserRole.HospitalProvider)).toBe('Hospital Provider');
    expect(component.getRoleDisplayText(UserRole.PolicyHolder)).toBe('Policy Holder');
  });

  it('should toggle sidebar collapsed state', () => {
    component.isCollapsed = false;
    component.toggleSidebar();
    expect(component.isCollapsed).toBe(true);
    component.toggleSidebar();
    expect(component.isCollapsed).toBe(false);
  });

  it('should update currentRoute on NavigationEnd event', () => {
    const navigationEndEvent = new NavigationEnd(1, '/dashboard', '/dashboard');
    routerEventsSubject.next(navigationEndEvent);
    expect(component.currentRoute).toBe('/dashboard');
  });
});
