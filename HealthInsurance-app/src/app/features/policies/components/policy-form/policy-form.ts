import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PolicyService } from '../../services/policy.service';
import { InsurancePlanService } from '../../../admin/services/insurance-plan.service';
import { UserService } from '../../../admin/services/user.service';
import { Policy } from '../../models/policy';
import { InsurancePlan } from '../../../admin/models/insurance-plan';
import { User, UserRole } from '../../../admin/models/user';

@Component({
  selector: 'app-policy-form',
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
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './policy-form.html',
  styleUrls: ['./policy-form.css']
})
export class PolicyFormComponent implements OnInit {
  policyForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  policyId: number | null = null;
  insurancePlans: InsurancePlan[] = [];
  policyHolders: User[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private insurancePlanService: InsurancePlanService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.policyForm = this.fb.group({
      userId: ['', [Validators.required, Validators.min(1)]],
      planId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      premiumPaid: ['', [Validators.required, Validators.min(0.01)]],
      status: ['1', Validators.required],
      autoRenew: [false]
    });


  }

  ngOnInit(): void {
    this.loadInsurancePlans();
    this.loadPolicyHolders();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.policyId = +id;
      this.loadPolicy(this.policyId);
    }
  }

  loadInsurancePlans(): void {
    this.insurancePlanService.getActivePlans().subscribe({
      next: (plans) => {
        this.insurancePlans = plans;
      },
      error: (error) => {
        console.error('Error loading insurance plans:', error);
        this.snackBar.open('Failed to load insurance plans', 'Close', { duration: 3000 });
      }
    });
  }

  loadPolicyHolders(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.policyHolders = users
          .filter(user => user.role === UserRole.PolicyHolder)
          .sort((a, b) => {
            const nameA = `${a.firstName} ${a.lastName}`;
            const nameB = `${b.firstName} ${b.lastName}`;
            const lowerA = nameA.toLowerCase();
            const lowerB = nameB.toLowerCase();
            
            // First compare case-insensitive
            const comparison = lowerA.localeCompare(lowerB);
            if (comparison !== 0) {
              return comparison;
            }
            
            // If names are identical when case-insensitive, lowercase comes first
            return nameA.localeCompare(nameB);
          });
      },
      error: (error) => {
        console.error('Error loading policy holders:', error);
        this.snackBar.open('Failed to load policy holders', 'Close', { duration: 3000 });
      }
    });
  }

  loadPolicy(id: number): void {
    this.policyService.getPolicyById(id).subscribe({
      next: (policy) => {
        this.policyForm.patchValue({
          userId: policy.userId,
          planId: policy.planId,
          startDate: new Date(policy.startDate),
          endDate: new Date(policy.endDate),
          premiumPaid: policy.premiumPaid,
          status: policy.status.toString(),
          autoRenew: policy.autoRenew
        });
      },
      error: (error) => {
        console.error('Error loading policy:', error);
        this.snackBar.open('Failed to load policy details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }



  onSubmit(): void {
    if (this.policyForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData = {
        userId: this.policyForm.value.userId,
        planId: this.policyForm.value.planId,
        startDate: this.policyForm.value.startDate,
        premiumPaid: this.policyForm.value.premiumPaid,
        status: parseInt(this.policyForm.value.status, 10),
        autoRenew: this.policyForm.value.autoRenew
      };

      // For edit mode, include endDate
      if (this.isEditMode) {
        Object.assign(formData, {
          endDate: this.policyForm.value.endDate
        });
      }

      const request = this.isEditMode && this.policyId
        ? this.policyService.updatePolicy(this.policyId, formData)
        : this.policyService.createPolicy(formData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            `Policy ${this.isEditMode ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.goBack();
        },
        error: (error) => {
          console.error('Error saving policy:', error);
          const errorMessage = error.error?.message || error.message || `Failed to ${this.isEditMode ? 'update' : 'create'} policy`;
          this.snackBar.open(
            errorMessage,
            'Close',
            { duration: 5000 }
          );
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/policies']);
  }
}
