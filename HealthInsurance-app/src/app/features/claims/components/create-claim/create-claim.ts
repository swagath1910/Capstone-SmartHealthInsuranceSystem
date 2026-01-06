import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaimService } from '../../services/claim.service';
import { PolicyService } from '../../../policies/services/policy.service';
import { HospitalService } from '../../../admin/services/hospital.service';
import { Policy } from '../../../policies/models/policy';
import { Hospital } from '../../../admin/models/hospital';

@Component({
  selector: 'app-create-claim',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './create-claim.html',
  styleUrls: ['./create-claim.css']
})
export class CreateClaimComponent implements OnInit {
  claimForm: FormGroup;
  isLoading = false;
  policies: Policy[] = [];
  hospitals: Hospital[] = [];

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService,
    private policyService: PolicyService,
    private hospitalService: HospitalService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.claimForm = this.fb.group({
      policyId: ['', Validators.required],
      hospitalId: ['', Validators.required],
      claimAmount: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loadPolicies();
      this.loadHospitals();
    });
  }

  loadPolicies(): void {
    this.policyService.getMyPolicies().subscribe({
      next: (policies) => {
        this.policies = policies;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to load policies', 'Close', { duration: 3000 });
      }
    });
  }

  loadHospitals(): void {
    this.hospitalService.getAllHospitals().subscribe({
      next: (hospitals) => {
        this.hospitals = hospitals;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to load hospitals', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.claimForm.valid) {
      this.isLoading = true;
      this.claimService.createClaim(this.claimForm.value).subscribe({
        next: (claim) => {
          this.snackBar.open('Claim created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/claims']);
        },
        error: (error) => {
          this.snackBar.open('Failed to create claim', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/claims']);
  }
}