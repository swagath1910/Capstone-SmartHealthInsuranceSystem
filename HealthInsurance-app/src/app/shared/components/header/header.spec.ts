import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { UserRole } from '../../../features/admin/models/user';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockLocation: any;
  let logoutCalled = false;
  let navigateCalled = false;
  let backCalled = false;
  let forwardCalled = false;

  beforeEach(async () => {
    logoutCalled = false;
    navigateCalled = false;
    backCalled = false;
    forwardCalled = false;

    mockAuthService = {
      currentUser$: of(null),
      logout: () => { logoutCalled = true; }
    };
    mockRouter = {
      navigate: (route: any[]) => { 
        navigateCalled = true; 
        return Promise.resolve(true); 
      }
    };
    mockLocation = {
      back: () => { backCalled = true; },
      forward: () => { forwardCalled = true; }
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to currentUser$ on init', () => {
    expect(component.currentUser).toBeNull();
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(backCalled).toBe(true);
  });

  it('should navigate forward when goForward is called', () => {
    component.goForward();
    expect(forwardCalled).toBe(true);
  });

  it('should logout and navigate to login', () => {
    component.logout();
    expect(logoutCalled).toBe(true);
    expect(navigateCalled).toBe(true);
  });

  it('should return correct role display text', () => {
    expect(component.getRoleDisplayText(UserRole.Admin)).toBe('Admin');
    expect(component.getRoleDisplayText(UserRole.InsuranceAgent)).toBe('Insurance Agent');
    expect(component.getRoleDisplayText(UserRole.ClaimsOfficer)).toBe('Claims Officer');
    expect(component.getRoleDisplayText(UserRole.HospitalProvider)).toBe('Hospital Provider');
    expect(component.getRoleDisplayText(UserRole.PolicyHolder)).toBe('Policy Holder');
  });

  it('should toggle sidebar', () => {
    component.sidebarOpen = true;
    component.toggleSidebar();
    expect(component.sidebarOpen).toBe(false);
  });

  it('should navigate to specified route', () => {
    navigateCalled = false;
    component.navigateTo('/dashboard');
    expect(navigateCalled).toBe(true);
  });
});


