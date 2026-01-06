import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HospitalFormComponent } from './hospital-form';
import { HospitalService } from '../../services/hospital.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

describe('HospitalFormComponent', () => {
  let component: HospitalFormComponent;
  let fixture: ComponentFixture<HospitalFormComponent>;
  let mockHospitalService: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockSnackBar: any;

  const mockHospital = {
    hospitalId: 1,
    hospitalName: 'City Hospital',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phoneNumber: '555-1234',
    email: 'info@cityhospital.com',
    isNetworkProvider: true
  };

  beforeEach(async () => {
    mockHospitalService = {
      getHospitalById: (id: number) => of(mockHospital),
      createHospital: (data: any) => of(mockHospital),
      updateHospital: (id: number, data: any) => of(mockHospital)
    };

    mockRouter = {
      navigate: () => Promise.resolve(true)
    };

    mockRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => null
        }
      }
    };

    mockSnackBar = {
      open: () => ({})
    };

    await TestBed.configureTestingModule({
      imports: [HospitalFormComponent, BrowserAnimationsModule],
      providers: [
        { provide: HospitalService, useValue: mockHospitalService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HospitalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values in add mode', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.hospitalForm.get('hospitalName')?.value).toBe('');
    expect(component.hospitalForm.get('address')?.value).toBe('');
  });

  it('should load hospital data in edit mode', async () => {
    mockRoute.snapshot.paramMap.get = (key: string) => '1';
    
    const newFixture = TestBed.createComponent(HospitalFormComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(newComponent.isEditMode).toBe(true);
    expect(newComponent.hospitalId).toBe(1);
  });

  it('should have required validators on form fields', () => {
    const hospitalNameControl = component.hospitalForm.get('hospitalName');
    const addressControl = component.hospitalForm.get('address');
    const cityControl = component.hospitalForm.get('city');
    const stateControl = component.hospitalForm.get('state');
    const phoneNumberControl = component.hospitalForm.get('phoneNumber');

    hospitalNameControl?.setValue('');
    expect(hospitalNameControl?.hasError('required')).toBe(true);

    addressControl?.setValue('');
    expect(addressControl?.hasError('required')).toBe(true);

    cityControl?.setValue('');
    expect(cityControl?.hasError('required')).toBe(true);

    stateControl?.setValue('');
    expect(stateControl?.hasError('required')).toBe(true);

    phoneNumberControl?.setValue('');
    expect(phoneNumberControl?.hasError('required')).toBe(true);
  });

  it('should have email validator on email field', () => {
    const emailControl = component.hospitalForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should submit form when valid in create mode', async () => {
    let createCalled = false;
    mockHospitalService.createHospital = (data: any) => {
      createCalled = true;
      return of(mockHospital);
    };

    component.hospitalForm.patchValue({
      hospitalName: 'Test Hospital',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      phoneNumber: '555-9999',
      email: 'test@hospital.com',
      isNetworkProvider: true
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(createCalled).toBe(true);
  });

  it('should submit form when valid in edit mode', async () => {
    component.isEditMode = true;
    component.hospitalId = 1;

    let updateCalled = false;
    mockHospitalService.updateHospital = (id: number, data: any) => {
      updateCalled = true;
      return of(mockHospital);
    };

    component.hospitalForm.patchValue({
      hospitalName: 'Updated Hospital',
      address: '456 Updated St',
      city: 'Updated City',
      state: 'UP',
      zipCode: '54321',
      phoneNumber: '555-8888',
      email: 'updated@hospital.com',
      isNetworkProvider: false
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(updateCalled).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    let createCalled = false;
    mockHospitalService.createHospital = (data: any) => {
      createCalled = true;
      return of(mockHospital);
    };

    component.hospitalForm.patchValue({
      hospitalName: '',
      address: '',
      city: '',
      state: '',
      phoneNumber: ''
    });

    component.onSubmit();

    expect(createCalled).toBe(false);
    expect(component.isSubmitting).toBe(false);
  });

  it('should handle error when loading hospital', async () => {
    mockHospitalService.getHospitalById = () => throwError(() => new Error('Load failed'));
    mockRoute.snapshot.paramMap.get = (key: string) => '1';

    const newFixture = TestBed.createComponent(HospitalFormComponent);
    const newComponent = newFixture.componentInstance;
    
    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return {};
    };

    newFixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(snackBarCalled).toBe(true);
  });

  it('should handle error when submitting form', async () => {
    mockHospitalService.createHospital = () => throwError(() => new Error('Submit failed'));

    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return {};
    };

    component.hospitalForm.patchValue({
      hospitalName: 'Test Hospital',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      phoneNumber: '555-9999',
      email: 'test@hospital.com',
      isNetworkProvider: true
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(snackBarCalled).toBe(true);
    expect(component.isSubmitting).toBe(false);
  });

  it('should navigate back when goBack is called', () => {
    let navigateCalled = false;
    mockRouter.navigate = (route: any[]) => {
      navigateCalled = true;
      expect(route).toEqual(['/hospitals']);
      return Promise.resolve(true);
    };

    component.goBack();

    expect(navigateCalled).toBe(true);
  });

  it('should set isSubmitting to true during submission', () => {
    component.hospitalForm.patchValue({
      hospitalName: 'Test Hospital',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      phoneNumber: '555-9999',
      email: 'test@hospital.com',
      isNetworkProvider: true
    });

    expect(component.isSubmitting).toBe(false);
    
    component.onSubmit();
    
    expect(component.isSubmitting).toBe(true);
  });
});
