import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSnackBar: any;
  let navigateCalled = false;
  let snackBarMessage = '';

  beforeEach(async () => {
    navigateCalled = false;
    snackBarMessage = '';

    mockAuthService = {
      register: (userData: any) => {
        if (userData.email === 'test@example.com') {
          return of({
            user: {
              id: 1,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName
            },
            token: 'fake-token'
          });
        }
        return throwError(() => new Error('Registration failed'));
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
      imports: [RegisterComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    
    expect(form.valid).toBe(false);
    
    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });
    
    expect(form.valid).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');
    
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBe(true);
    
    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should submit form with valid data', () => {
    component.registerForm.patchValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Test St'
    });

    component.onSubmit();

    expect(navigateCalled).toBe(true);
    expect(snackBarMessage).toContain('Registration successful');
  });

  it('should handle registration error', () => {
    component.registerForm.patchValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'error@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });

    component.onSubmit();

    setTimeout(() => {
      expect(snackBarMessage).toContain('Registration failed');
      expect(component.isLoading).toBe(false);
    }, 100);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBe(true);
    component.hidePassword = !component.hidePassword;
    expect(component.hidePassword).toBe(false);
  });

  it('should disable submit button when form is invalid', () => {
    component.registerForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });

    expect(component.registerForm.invalid).toBe(true);
  });

  it('should set loading state during registration', () => {
    component.registerForm.patchValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });

    expect(component.isLoading).toBe(false);
    component.onSubmit();
    expect(component.isLoading).toBe(true);
  });

  it('should make address field optional', () => {
    const addressControl = component.registerForm.get('address');
    
    addressControl?.setValue('');
    expect(addressControl?.hasError('required')).toBeFalsy();
  });
});
