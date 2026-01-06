import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HospitalClaimsComponent } from './hospital-claims';
import { ClaimService } from '../../services/claim.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ClaimStatus } from '../../models/claim';

describe('HospitalClaimsComponent', () => {
  let component: HospitalClaimsComponent;
  let fixture: ComponentFixture<HospitalClaimsComponent>;
  let mockClaimService: any;
  let mockSnackBar: any;
  let mockCdr: any;

  const mockClaims = [
    {
      claimId: 1,
      claimNumber: 'CLM-001',
      policyId: 1,
      policyNumber: 'POL-001',
      userId: 1,
      hospitalName: 'Test Hospital',
      userName: 'John Doe',
      claimAmount: 5000,
      approvedAmount: undefined,
      treatmentDate: new Date('2026-01-01'),
      submittedAt: new Date('2026-01-02'),
      treatmentDetails: 'Test treatment',
      notes: 'Test notes',
      status: ClaimStatus.Submitted,
      reviewerName: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined
    },
    {
      claimId: 2,
      claimNumber: 'CLM-002',
      policyId: 2,
      policyNumber: 'POL-002',
      userId: 2,
      hospitalName: 'Test Hospital',
      userName: 'Jane Smith',
      claimAmount: 3000,
      approvedAmount: undefined,
      treatmentDate: new Date('2026-01-05'),
      submittedAt: new Date('2026-01-06'),
      treatmentDetails: 'Another treatment',
      notes: undefined,
      status: ClaimStatus.InReview,
      reviewerName: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined
    }
  ];

  beforeEach(async () => {
    mockClaimService = {
      getHospitalClaims: () => of(mockClaims),
      addMedicalNotes: (claimId: number, notes: any) => of({ ...mockClaims[0], medicalNotes: notes.medicalNotes })
    };

    mockSnackBar = {
      open: (message: string, action?: string, config?: any) => ({
        onAction: () => of(null)
      })
    };

    mockCdr = {
      detectChanges: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [HospitalClaimsComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: ClaimService, useValue: mockClaimService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HospitalClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hospital claims on init', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.allClaims.length).toBe(2);
  });

  it('should have correct displayed columns', () => {
    expect(component.allDisplayedColumns).toContain('claimNumber');
    expect(component.allDisplayedColumns).toContain('patientName');
    expect(component.allDisplayedColumns).toContain('claimAmount');
    expect(component.allDisplayedColumns).toContain('submittedAt');
    expect(component.allDisplayedColumns).toContain('status');
    expect(component.allDisplayedColumns).toContain('actions');
  });

  it('should initialize medical notes form', () => {
    expect(component.medicalNotesForm.get('medicalNotes')?.value).toBe('');
    expect(component.medicalNotesForm.get('medicalNotes')?.hasError('required')).toBe(true);
  });

  it('should open medical notes dialog', () => {
    const claim = mockClaims[0];
    component.addMedicalNotes(claim);
    
    expect(component.showMedicalNotesDialog).toBe(true);
    expect(component.selectedClaim).toBe(claim);
  });

  it('should close medical notes dialog', () => {
    component.showMedicalNotesDialog = true;
    component.selectedClaim = mockClaims[0];
    
    component.closeMedicalNotesDialog();
    
    expect(component.showMedicalNotesDialog).toBe(false);
    expect(component.selectedClaim).toBe(null);
  });

  it('should submit medical notes successfully', async () => {
    component.selectedClaim = mockClaims[0];
    component.medicalNotesForm.patchValue({
      medicalNotes: 'Patient shows good recovery progress'
    });

    let snackBarCalled = false;
    mockSnackBar.open = (message: string) => {
      snackBarCalled = true;
      expect(message).toContain('Medical notes added successfully');
      return { onAction: () => of(null) };
    };

    component.submitMedicalNotes();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(snackBarCalled).toBe(true);
    expect(component.showMedicalNotesDialog).toBe(false);
  });

  it('should handle medical notes submission error', async () => {
    mockClaimService.addMedicalNotes = () => throwError(() => new Error('Failed'));
    
    component.selectedClaim = mockClaims[0];
    component.medicalNotesForm.patchValue({
      medicalNotes: 'Test medical notes'
    });

    let snackBarCalled = false;
    mockSnackBar.open = (message: string) => {
      snackBarCalled = true;
      expect(message).toContain('Failed to add medical notes');
      return { onAction: () => of(null) };
    };

    component.submitMedicalNotes();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(snackBarCalled).toBe(true);
    expect(component.isSubmitting).toBe(false);
  });

  it('should not submit invalid medical notes form', () => {
    component.selectedClaim = mockClaims[0];
    component.medicalNotesForm.patchValue({
      medicalNotes: 'short' // Less than minimum length
    });

    let serviceCalled = false;
    mockClaimService.addMedicalNotes = () => {
      serviceCalled = true;
      return of({});
    };

    component.submitMedicalNotes();

    expect(serviceCalled).toBe(false);
  });

  it('should get correct status text', () => {
    expect(component.getStatusText(ClaimStatus.Submitted)).toBe('Submitted');
    expect(component.getStatusText(ClaimStatus.InReview)).toBe('In Review');
    expect(component.getStatusText(ClaimStatus.Approved)).toBe('Approved');
    expect(component.getStatusText(ClaimStatus.Rejected)).toBe('Rejected');
    expect(component.getStatusText(ClaimStatus.Paid)).toBe('Paid');
  });

  it('should handle error when loading claims', async () => {
    mockClaimService.getHospitalClaims = () => throwError(() => new Error('Failed'));
    
    let snackBarCalled = false;
    mockSnackBar.open = (message: string) => {
      snackBarCalled = true;
      expect(message).toContain('Failed to load hospital claims');
      return { onAction: () => of(null) };
    };

    component.loadAllHospitalClaims();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(snackBarCalled).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('should validate medical notes minimum length', () => {
    const medicalNotesControl = component.medicalNotesForm.get('medicalNotes');
    
    medicalNotesControl?.setValue('short');
    expect(medicalNotesControl?.hasError('minlength')).toBe(true);
    
    medicalNotesControl?.setValue('This is a valid medical note with sufficient length');
    expect(medicalNotesControl?.hasError('minlength')).toBe(false);
  });
});