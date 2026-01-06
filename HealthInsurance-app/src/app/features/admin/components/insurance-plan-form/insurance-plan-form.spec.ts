import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsurancePlanFormComponent } from './insurance-plan-form';
import { InsurancePlanService } from '../../services/insurance-plan.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { PlanType } from '../../models/insurance-plan';

describe('InsurancePlanFormComponent', () => {
  let component: InsurancePlanFormComponent;
  let fixture: ComponentFixture<InsurancePlanFormComponent>;
  let mockPlanService: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockSnackBar: any;

  const mockPlan = {
    planId: 1,
    planName: 'Basic Health Plan',
    planType: PlanType.Individual,
    description: 'A basic health insurance plan',
    premiumAmount: 100,
    coverageLimit: 50000,
    durationInMonths: 12,
    deductiblePercentage: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    mockPlanService = {
      getPlanById: (id: number) => of(mockPlan),
      createPlan: (data: any) => of(mockPlan),
      updatePlan: (id: number, data: any) => of(mockPlan)
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
      imports: [InsurancePlanFormComponent, BrowserAnimationsModule],
      providers: [
        { provide: InsurancePlanService, useValue: mockPlanService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InsurancePlanFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values in create mode', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.planForm.get('planName')?.value).toBe('');
    expect(component.planForm.get('planType')?.value).toBe(1);
  });

  it('should load plan data in edit mode', async () => {
    mockRoute.snapshot.paramMap.get = (key: string) => '1';
    
    const newFixture = TestBed.createComponent(InsurancePlanFormComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(newComponent.isEditMode).toBe(true);
    expect(newComponent.planId).toBe(1);
  });

  it('should have required validators on form fields', () => {
    const planNameControl = component.planForm.get('planName');
    const planTypeControl = component.planForm.get('planType');
    const premiumAmountControl = component.planForm.get('premiumAmount');
    const coverageLimitControl = component.planForm.get('coverageLimit');
    const durationControl = component.planForm.get('durationInMonths');
    const deductibleControl = component.planForm.get('deductiblePercentage');

    planNameControl?.setValue('');
    expect(planNameControl?.hasError('required')).toBe(true);

    planTypeControl?.setValue('');
    expect(planTypeControl?.hasError('required')).toBe(true);

    premiumAmountControl?.setValue('');
    expect(premiumAmountControl?.hasError('required')).toBe(true);

    coverageLimitControl?.setValue('');
    expect(coverageLimitControl?.hasError('required')).toBe(true);

    durationControl?.setValue('');
    expect(durationControl?.hasError('required')).toBe(true);

    deductibleControl?.setValue('');
    expect(deductibleControl?.hasError('required')).toBe(true);
  });

  it('should have min validators on numeric fields', () => {
    const premiumAmountControl = component.planForm.get('premiumAmount');
    const coverageLimitControl = component.planForm.get('coverageLimit');
    const durationControl = component.planForm.get('durationInMonths');
    const deductibleControl = component.planForm.get('deductiblePercentage');

    premiumAmountControl?.setValue(0);
    expect(premiumAmountControl?.hasError('min')).toBe(true);

    coverageLimitControl?.setValue(0);
    expect(coverageLimitControl?.hasError('min')).toBe(true);

    durationControl?.setValue(0);
    expect(durationControl?.hasError('min')).toBe(true);

    deductibleControl?.setValue(-1);
    expect(deductibleControl?.hasError('min')).toBe(true);
  });

  it('should have max validator on deductible percentage', () => {
    const deductibleControl = component.planForm.get('deductiblePercentage');
    
    deductibleControl?.setValue(101);
    expect(deductibleControl?.hasError('max')).toBe(true);

    deductibleControl?.setValue(100);
    expect(deductibleControl?.hasError('max')).toBe(false);
  });

  it('should submit form when valid in create mode', async () => {
    let createCalled = false;
    mockPlanService.createPlan = (data: any) => {
      createCalled = true;
      return of(mockPlan);
    };

    component.planForm.patchValue({
      planName: 'Test Plan',
      planType: 1,
      description: 'Test Description',
      premiumAmount: 100,
      coverageLimit: 50000,
      durationInMonths: 12,
      deductiblePercentage: 10,
      isActive: true
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(createCalled).toBe(true);
  });

  it('should submit form when valid in edit mode', async () => {
    component.isEditMode = true;
    component.planId = 1;

    let updateCalled = false;
    mockPlanService.updatePlan = (id: number, data: any) => {
      updateCalled = true;
      return of(mockPlan);
    };

    component.planForm.patchValue({
      planName: 'Updated Plan',
      planType: 2,
      description: 'Updated Description',
      premiumAmount: 150,
      coverageLimit: 75000,
      durationInMonths: 24,
      deductiblePercentage: 15,
      isActive: true
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(updateCalled).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    let createCalled = false;
    mockPlanService.createPlan = (data: any) => {
      createCalled = true;
      return of(mockPlan);
    };

    component.planForm.patchValue({
      planName: '',
      premiumAmount: '',
      coverageLimit: '',
      durationInMonths: '',
      deductiblePercentage: ''
    });

    component.onSubmit();

    expect(createCalled).toBe(false);
    expect(component.isSubmitting).toBe(false);
  });

  it('should handle error when loading plan', async () => {
    mockPlanService.getPlanById = () => throwError(() => new Error('Load failed'));
    mockRoute.snapshot.paramMap.get = (key: string) => '1';

    const newFixture = TestBed.createComponent(InsurancePlanFormComponent);
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
    mockPlanService.createPlan = () => throwError(() => new Error('Submit failed'));

    let snackBarCalled = false;
    mockSnackBar.open = () => {
      snackBarCalled = true;
      return {};
    };

    component.planForm.patchValue({
      planName: 'Test Plan',
      planType: 1,
      description: 'Test Description',
      premiumAmount: 100,
      coverageLimit: 50000,
      durationInMonths: 12,
      deductiblePercentage: 10,
      isActive: true
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
      expect(route).toEqual(['/insurance-plans']);
      return Promise.resolve(true);
    };

    component.goBack();

    expect(navigateCalled).toBe(true);
  });

  it('should set isSubmitting to true during submission', () => {
    component.planForm.patchValue({
      planName: 'Test Plan',
      planType: 1,
      description: 'Test Description',
      premiumAmount: 100,
      coverageLimit: 50000,
      durationInMonths: 12,
      deductiblePercentage: 10,
      isActive: true
    });

    expect(component.isSubmitting).toBe(false);
    
    component.onSubmit();
    
    expect(component.isSubmitting).toBe(true);
  });

  it('should convert planType to integer on submit', async () => {
    let submittedData: any;
    mockPlanService.createPlan = (data: any) => {
      submittedData = data;
      return of(mockPlan);
    };

    component.planForm.patchValue({
      planName: 'Test Plan',
      planType: '2',
      description: 'Test Description',
      premiumAmount: 100,
      coverageLimit: 50000,
      durationInMonths: 12,
      deductiblePercentage: 10,
      isActive: true
    });

    component.onSubmit();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(typeof submittedData.planType).toBe('number');
  });
});
