import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { UserRole } from '../../models/user';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockRoute: any;
  let mockRouter: any;
  let mockUserService: any;
  let mockAuthService: any;
  let mockSnackBar: any;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    address: '123 Main St',
    dateOfBirth: new Date('1990-01-01'),
    role: UserRole.PolicyHolder,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    mockRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => null
        }
      }
    };

    mockRouter = {
      navigate: (commands: any[]) => Promise.resolve(true)
    };

    mockUserService = {
      getUserById: (id: number) => of(mockUser),
      createUser: (data: any) => of(mockUser),
      updateUser: (id: number, data: any) => of(mockUser)
    };

    mockAuthService = {
      getCurrentUser: () => ({ id: 1, email: 'admin@test.com', role: UserRole.Admin })
    };

    mockSnackBar = {
      open: (message: string, action: string, config: any) => {}
    };

    await TestBed.configureTestingModule({
      imports: [UserFormComponent]
    }).compileComponents();

    TestBed.overrideComponent(UserFormComponent, {
      set: {
        providers: [
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: Router, useValue: mockRouter },
          { provide: UserService, useValue: mockUserService },
          { provide: AuthService, useValue: mockAuthService },
          { provide: MatSnackBar, useValue: mockSnackBar }
        ]
      }
    });

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values in create mode', () => {
    fixture.detectChanges();
    expect(component.isEditMode).toBe(false);
    expect(component.userForm.get('firstName')?.value).toBe('');
    expect(component.userForm.get('role')?.value).toBe(5);
  });

  it('should require password in create mode', () => {
    fixture.detectChanges();
    const passwordControl = component.userForm.get('password');
    expect(passwordControl?.hasError('required')).toBe(true);
  });

  it('should validate password minimum length', () => {
    fixture.detectChanges();
    const passwordControl = component.userForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBe(true);
  });

  it('should load user data in edit mode', () => {
    mockRoute.snapshot.paramMap.get = () => '1';
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.isEditMode).toBe(true);
      expect(component.userId).toBe(1);
      expect(component.userForm.get('firstName')?.value).toBe('John');
    }, 100);
  });

  it('should validate email format', () => {
    fixture.detectChanges();
    const emailControl = component.userForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
  });

  it('should mark form as invalid when required fields are empty', () => {
    fixture.detectChanges();
    expect(component.userForm.invalid).toBe(true);
  });

  it('should mark form as valid when all required fields are filled', () => {
    fixture.detectChanges();
    component.userForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });
    expect(component.userForm.valid).toBe(true);
  });

  it('should create user when form is submitted in create mode', () => {
    fixture.detectChanges();
    component.userForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });
    component.onSubmit();
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalled();
    }, 100);
  });

  it('should update user when form is submitted in edit mode', () => {
    mockRoute.snapshot.paramMap.get = () => '1';
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    setTimeout(() => {
      component.userForm.patchValue({
        firstName: 'Updated John'
      });
      component.onSubmit();
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalled();
      }, 100);
    }, 100);
  });

  it('should navigate to users list when going back', () => {
    fixture.detectChanges();
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should navigate to dashboard for insurance agents', () => {
    mockAuthService.getCurrentUser = () => ({ id: 1, email: 'agent@test.com', role: UserRole.InsuranceAgent });
    fixture.detectChanges();
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should reset form for insurance agents after creating user', () => {
    mockAuthService.getCurrentUser = () => ({ id: 1, email: 'agent@test.com', role: UserRole.InsuranceAgent });
    fixture.detectChanges();
    component.userForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });
    component.onSubmit();
    setTimeout(() => {
      expect(component.userForm.get('firstName')?.value).toBe(null);
    }, 100);
  });

  it('should handle error when loading user fails', () => {
    mockUserService.getUserById = () => throwError(() => ({ status: 404 }));
    mockRoute.snapshot.paramMap.get = () => '1';
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalled();
    }, 100);
  });

  it('should handle error when creating user fails', () => {
    mockUserService.createUser = () => throwError(() => ({ error: 'Creation failed' }));
    fixture.detectChanges();
    component.userForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });
    component.onSubmit();
    setTimeout(() => {
      expect(component.isSubmitting).toBe(false);
    }, 100);
  });

  it('should prevent multiple form submissions', () => {
    fixture.detectChanges();
    component.userForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      dateOfBirth: new Date('1990-01-01')
    });
    component.isSubmitting = true;
    component.onSubmit();
    expect(mockUserService.createUser).not.toHaveBeenCalled();
  });
});
