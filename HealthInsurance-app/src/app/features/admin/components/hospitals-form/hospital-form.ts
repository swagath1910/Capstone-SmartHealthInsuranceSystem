import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HospitalService } from '../../services/hospital.service';

@Component({
  selector: 'app-hospital-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './hospital-form.html',
  styleUrls: ['./hospital-form.css']
})
export class HospitalFormComponent implements OnInit {
  hospitalForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  hospitalId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private hospitalService: HospitalService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.hospitalForm = this.fb.group({
      hospitalName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: [''],  // Made optional
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      isNetworkProvider: [true]
    });
  }

  getFormErrors(): string {
    const errors: string[] = [];
    Object.keys(this.hospitalForm.controls).forEach(key => {
      const control = this.hospitalForm.get(key);
      if (control && control.errors) {
        errors.push(`${key}: ${JSON.stringify(control.errors)}`);
      }
    });
    return errors.join(', ') || 'Unknown error';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.hospitalId = +id;
      this.loadHospital(this.hospitalId);
    }
  }

  loadHospital(id: number): void {
    this.hospitalService.getHospitalById(id).subscribe({
      next: (hospital) => {
        this.hospitalForm.patchValue({
          hospitalName: hospital.hospitalName,
          address: hospital.address,
          city: hospital.city,
          state: hospital.state,
          zipCode: hospital.zipCode,
          phoneNumber: hospital.phoneNumber,
          email: hospital.email,
          isNetworkProvider: hospital.isNetworkProvider
        });
      },
      error: (error) => {
        console.error('Error loading hospital:', error);
        this.snackBar.open('Failed to load hospital details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.hospitalForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      console.log('Submitting hospital form:', {
        isEditMode: this.isEditMode,
        hospitalId: this.hospitalId,
        formData: this.hospitalForm.value
      });

      const request = this.isEditMode && this.hospitalId
        ? this.hospitalService.updateHospital(this.hospitalId, this.hospitalForm.value)
        : this.hospitalService.createHospital(this.hospitalForm.value);

      request.subscribe({
        next: (response) => {
          console.log('Hospital saved successfully:', response);
          this.snackBar.open(
            `Hospital ${this.isEditMode ? 'updated' : 'added'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.goBack();
        },
        error: (error) => {
          console.error('Error saving hospital:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'add'} hospital: ${error.message || error.statusText}`,
            'Close',
            { duration: 5000 }
          );
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/hospitals']);
  }
}
