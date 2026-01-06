import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InsurancePlanService } from '../../services/insurance-plan.service';
import { PlanType } from '../../models/insurance-plan';

@Component({
  selector: 'app-insurance-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './insurance-plan-form.html',
  styleUrls: ['./insurance-plan-form.css']
})
export class InsurancePlanFormComponent implements OnInit {
  planForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  planId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private planService: InsurancePlanService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.planForm = this.fb.group({
      planName: ['', Validators.required],
      planType: [1, Validators.required],
      description: [''],
      premiumAmount: ['', [Validators.required, Validators.min(0.01)]],
      coverageLimit: ['', [Validators.required, Validators.min(0.01)]],
      durationInMonths: ['', [Validators.required, Validators.min(1)]],
      deductiblePercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.planId = +id;
      this.loadPlan(this.planId);
    }
  }

  loadPlan(id: number): void {
    this.planService.getPlanById(id).subscribe({
      next: (plan) => {
        this.planForm.patchValue({
          planName: plan.planName,
          planType: plan.planType,
          description: plan.description,
          premiumAmount: plan.premiumAmount,
          coverageLimit: plan.coverageLimit,
          durationInMonths: plan.durationInMonths,
          deductiblePercentage: plan.deductiblePercentage,
          isActive: plan.isActive
        });
      },
      error: (error: any) => {
        console.error('Error loading plan:', error);
        this.snackBar.open('Failed to load plan details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.planForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData = {
        ...this.planForm.value,
        planType: parseInt(this.planForm.value.planType, 10)
      };

      const request = this.isEditMode && this.planId
        ? this.planService.updatePlan(this.planId, formData)
        : this.planService.createPlan(formData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            `Insurance plan ${this.isEditMode ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.goBack();
        },
        error: (error: any) => {
          console.error('Error saving plan:', error);
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'create'} insurance plan`,
            'Close',
            { duration: 3000 }
          );
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/insurance-plans']);
  }
}
