import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ClaimService } from '../../services/claim.service';
import { Claim, AddMedicalNotesDto, ClaimStatus } from '../../models/claim';

@Component({
  selector: 'app-hospital-claims',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hospital-claims.html',
  styleUrls: ['./hospital-claims.css']
})
export class HospitalClaimsComponent implements OnInit {
  allClaims: Claim[] = [];
  allDisplayedColumns = ['claimNumber', 'patientName', 'claimAmount', 'submittedAt', 'status', 'actions'];
  
  showMedicalNotesDialog = false;
  selectedClaim: Claim | null = null;
  medicalNotesForm: FormGroup;
  isSubmitting = false;
  isLoading = false;

  constructor(
    private claimService: ClaimService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.medicalNotesForm = this.fb.group({
      medicalNotes: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadAllHospitalClaims();
  }

  loadAllHospitalClaims(): void {
    this.isLoading = true;
    this.claimService.getHospitalClaims().subscribe({
      next: (claims) => {
        this.allClaims = claims;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load hospital claims', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  addMedicalNotes(claim: Claim): void {
    this.selectedClaim = claim;
    this.medicalNotesForm.reset();
    this.showMedicalNotesDialog = true;
    this.cdr.detectChanges();
  }

  closeMedicalNotesDialog(): void {
    this.showMedicalNotesDialog = false;
    this.selectedClaim = null;
    this.cdr.detectChanges();
  }

  submitMedicalNotes(): void {
    if (this.medicalNotesForm.valid && this.selectedClaim) {
      this.isSubmitting = true;
      const medicalNotesDto: AddMedicalNotesDto = {
        medicalNotes: this.medicalNotesForm.value.medicalNotes
      };

      this.claimService.addMedicalNotes(this.selectedClaim.claimId, medicalNotesDto).subscribe({
        next: (updatedClaim) => {
          this.snackBar.open('Medical notes added successfully!', 'Close', { duration: 3000 });
          this.closeMedicalNotesDialog();
          this.loadAllHospitalClaims(); // Refresh the list
          this.isSubmitting = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to add medical notes', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  getStatusText(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.Submitted: return 'Submitted';
      case ClaimStatus.InReview: return 'In Review';
      case ClaimStatus.Approved: return 'Approved';
      case ClaimStatus.Rejected: return 'Rejected';
      case ClaimStatus.Paid: return 'Paid';
      default: return 'Unknown';
    }
  }
}