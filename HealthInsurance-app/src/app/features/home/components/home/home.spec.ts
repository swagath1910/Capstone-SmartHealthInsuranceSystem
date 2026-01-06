import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { Router } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: () => Promise.resolve(true)
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 features', () => {
    expect(component.features.length).toBe(4);
  });

  it('should have features with correct structure', () => {
    component.features.forEach(feature => {
      expect(feature.icon).toBeDefined();
      expect(feature.title).toBeDefined();
      expect(feature.description).toBeDefined();
    });
  });

  it('should have hospital network feature', () => {
    const hospitalFeature = component.features.find(f => f.title === 'Hospital Network');
    expect(hospitalFeature).toBeDefined();
    expect(hospitalFeature?.icon).toBe('🏥');
  });

  it('should have easy claims feature', () => {
    const claimsFeature = component.features.find(f => f.title === 'Easy Claims');
    expect(claimsFeature).toBeDefined();
    expect(claimsFeature?.icon).toBe('📋');
  });

  it('should have flexible plans feature', () => {
    const plansFeature = component.features.find(f => f.title === 'Flexible Plans');
    expect(plansFeature).toBeDefined();
    expect(plansFeature?.icon).toBe('💳');
  });

  it('should have instant support feature', () => {
    const supportFeature = component.features.find(f => f.title === 'Instant Support');
    expect(supportFeature).toBeDefined();
    expect(supportFeature?.icon).toBe('⚡');
  });

  it('should navigate to login', () => {
    let navigateCalled = false;
    let navigatePath = '';
    mockRouter.navigate = (path: string[]) => {
      navigateCalled = true;
      navigatePath = path[0];
      return Promise.resolve(true);
    };

    component.navigateToLogin();
    
    expect(navigateCalled).toBe(true);
    expect(navigatePath).toBe('/login');
  });

  it('should navigate to register', () => {
    let navigateCalled = false;
    let navigatePath = '';
    mockRouter.navigate = (path: string[]) => {
      navigateCalled = true;
      navigatePath = path[0];
      return Promise.resolve(true);
    };

    component.navigateToRegister();
    
    expect(navigateCalled).toBe(true);
    expect(navigatePath).toBe('/register');
  });
});
