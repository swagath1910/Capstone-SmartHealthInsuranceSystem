import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { HospitalService } from '../../services/hospital.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { UserRole } from '../../models/user';
import { Hospital } from '../../models/hospital';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  userId: number | null = null;
  hospitals: Hospital[] = [];
  UserRole = UserRole;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private hospitalService: HospitalService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Will be required conditionally
      phoneNumber: ['', Validators.required],
      address: [''],
      dateOfBirth: ['', Validators.required],
      role: [5, Validators.required], // Default to PolicyHolder
      hospitalId: [null]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadHospitals();
      this.setupRoleValidation();
      this.loadUser(this.userId);
    } else {
      // Add password validator for create mode
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadHospitals();
      this.setupRoleValidation();
    }
  }

  loadHospitals(): void {
    this.hospitalService.getAllHospitals().subscribe({
      next: (hospitals) => {
        this.hospitals = hospitals;
      },
      error: (error) => {
        console.error('Error loading hospitals:', error);
      }
    });
  }

  setupRoleValidation(): void {
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      const hospitalIdControl = this.userForm.get('hospitalId');
      
      if (role == UserRole.HospitalStaff) {
        hospitalIdControl?.setValidators([Validators.required]);
      } else {
        hospitalIdControl?.clearValidators();
        hospitalIdControl?.setValue(null);
      }
      hospitalIdControl?.updateValueAndValidity();
    });
  }

  loadUser(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          dateOfBirth: new Date(user.dateOfBirth),
          role: user.role,
          hospitalId: user.hospitalId
        });
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.snackBar.open('Failed to load user details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData = {
        ...this.userForm.value,
        role: parseInt(this.userForm.value.role, 10),
        dateOfBirth: this.formatDateToString(this.userForm.value.dateOfBirth)
      };

      let request: Observable<any>;
      
      if (this.isEditMode && this.userId) {
        // For update, remove password field
        const { password, ...updateData } = formData;
        request = this.userService.updateUser(this.userId, updateData);
      } else {
        // For create, use createUser which calls register endpoint
        request = this.userService.createUser(formData);
      }

      request.subscribe({
        next: () => {
          const action = this.isEditMode ? 'updated' : 'enrolled';
          const successMessage = `${this.userForm.value.firstName} ${this.userForm.value.lastName} ${action} successfully!`;
          this.snackBar.open(successMessage, 'Close', { duration: 5000 });
          
          // Reset form for insurance agents to allow enrolling another customer
          const currentUser = this.authService.getCurrentUser();
          if (currentUser?.role === UserRole.InsuranceAgent && !this.isEditMode) {
            setTimeout(() => {
              this.userForm.reset();
              this.userForm.patchValue({ role: 5, hospitalId: null }); // Default to PolicyHolder
              this.isSubmitting = false;
              this.cdr.detectChanges();
            });
          } else {
            this.goBack();
          }
        },
        error: (error) => {
          console.error('Error saving user:', error);
          console.error('Error details:', error.error);
          console.error('Error status:', error.status);
          
          let errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} user`;
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors && typeof error.error.errors === 'object') {
            const errorValues = Object.values(error.error.errors).flat();
            errorMessage = errorValues.join(', ');
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          // Use setTimeout to avoid NG0100 error
          setTimeout(() => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  isHospitalRequired(): boolean {
    return this.userForm.get('role')?.value == UserRole.HospitalStaff;
  }

  goBack(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === UserRole.InsuranceAgent) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/users']);
    }
  }

  private formatDateToString(date: Date | string): string {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
