import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PolicyService } from '../../services/policy.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { Policy, PolicyStatus } from '../../models/policy';
import { UserRole } from '../../../admin/models/user';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './policy-detail.html',
  styleUrls: ['./policy-detail.css']
})
export class PolicyDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  policy: Policy | null = null;
  error: string | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const policyId = this.route.snapshot.paramMap.get('id');
    if (policyId) {
      this.loadPolicy(+policyId);
    } else {
      this.error = 'Invalid policy ID';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPolicy(id: number): void {
    this.isLoading = true;
    
    this.policyService.getPolicyById(id).pipe(
      timeout(5000),
      catchError(() => {
        this.error = 'Failed to load policy details';
        return of(null);
      }),
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (policy) => {
        if (policy) {
          // Ensure policy has default values for new fields
          this.policy = {
            ...policy,
            remainingCoverage: policy.remainingCoverage ?? 0,
            coverageLimit: policy.coverageLimit ?? 50000, // Default coverage limit
            lastPremiumPaymentDate: policy.lastPremiumPaymentDate ?? undefined
          };
          this.error = null;
        } else if (!this.error) {
          this.error = 'Policy not found';
        }
      },
      error: (error) => {
        this.error = 'Failed to load policy details';
        this.snackBar.open('❌ Failed to load policy', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusClass(status: PolicyStatus): string {
    switch (status) {
      case PolicyStatus.Active:
        return 'status-active';
      case PolicyStatus.Expired:
        return 'status-expired';
      case PolicyStatus.Cancelled:
        return 'status-cancelled';
      case PolicyStatus.Suspended:
        return 'status-suspended';
      default:
        return '';
    }
  }

  canRenew(): boolean {
    if (!this.policy) return false;
    return this.policy.status === PolicyStatus.Active || 
           this.policy.status === PolicyStatus.Expired;
  }

  canEdit(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.Admin || 
           currentUser?.role === UserRole.InsuranceAgent;
  }

  editPolicy(): void {
    if (this.policy) {
      this.router.navigate(['/policies/edit', this.policy.policyId]);
    }
  }

  renewPolicy(): void {
    if (this.policy) {
      this.policyService.renewPolicy(this.policy.policyId).subscribe({
        next: (renewed) => {
          this.snackBar.open('✅ Policy renewed successfully!', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPolicy(this.policy!.policyId);
        },
        error: (error) => {
          this.snackBar.open('❌ Failed to renew policy', 'Close', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  goBack(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.InsuranceAgent) {
      this.router.navigate(['/policies']);
    } else {
      this.router.navigate(['/my-policies']);
    }
  }

  getCoveragePercentage(): number {
    if (!this.policy || !this.policy.coverageLimit || this.policy.coverageLimit === 0) {
      return 0;
    }
    return (this.policy.remainingCoverage / this.policy.coverageLimit) * 100;
  }

  getCoverageColor(): string {
    const percentage = this.getCoveragePercentage();
    if (percentage > 50) return 'primary';
    if (percentage > 25) return 'accent';
    return 'warn';
  }
}
