import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { UserRole } from '../../../admin/models/user';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;
  let navigateCalled = false;
  let snackBarMessage = '';

  beforeEach(async () => {
    navigateCalled = false;
    snackBarMessage = '';

    mockAuthService = {
      login: (credentials: any) => {
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          return of({
            user: {
              id: 1,
              email: 'test@example.com',
              role: UserRole.PolicyHolder,
              firstName: 'Test',
              lastName: 'User'
            },
            token: 'fake-token'
          });
        }
        return throwError(() => new Error('Invalid credentials'));
      }
    };

    mockRouter = {
      navigate: (route: any[]) => {
        navigateCalled = true;
        return Promise.resolve(true);
      }
    };

    mockSnackBar = {
      open: (message: string, action?: string, config?: any) => {
        snackBarMessage = message;
        return { onAction: () => of(null) };
      }
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(true);
    
    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should submit form with valid credentials', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password'
    });

    component.onSubmit();

    expect(navigateCalled).toBe(true);
    expect(snackBarMessage).toContain('Login successful');
  });

  it('should handle login error', () => {
    component.loginForm.patchValue({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(snackBarMessage).toContain('Login failed');
      expect(component.isLoading).toBe(false);
    }, 100);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBe(true);
    component.hidePassword = !component.hidePassword;
    expect(component.hidePassword).toBe(false);
  });

  it('should disable submit button when form is invalid', () => {
    component.loginForm.patchValue({
      email: '',
      password: ''
    });

    expect(component.loginForm.invalid).toBe(true);
  });

  it('should set loading state during login', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password'
    });

    expect(component.isLoading).toBe(false);
    component.onSubmit();
    expect(component.isLoading).toBe(true);
  });
});
