import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { InsurancePlanService } from '../../services/insurance-plan.service';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { InsurancePlan, PlanType } from '../../models/insurance-plan';
import { UserRole } from '../../models/user';

@Component({
  selector: 'app-insurance-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './insurance-plans.html',
  styleUrls: ['./insurance-plans.css']
})
export class InsurancePlansComponent implements OnInit {
  plans: InsurancePlan[] = [];
  filteredPlans: InsurancePlan[] = [];
  paginatedPlans: InsurancePlan[] = [];
  displayedColumns: string[] = [];
  
  // Filtering properties
  searchTerm: string = '';
  selectedStatus: string = '';
  
  // Pagination properties
  pageSize: number = 5;
  pageIndex: number = 0;
  
  // Expose PlanType enum to template
  PlanType = PlanType;

  constructor(
    private planService: InsurancePlanService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDisplayedColumns();
    this.loadPlans();
  }

  setDisplayedColumns(): void {
    const baseColumns = ['planName', 'description', 'premiumAmount', 'coverageLimit', 'deductiblePercentage', 'isActive'];
    this.displayedColumns = this.canManagePlans() 
      ? [...baseColumns, 'actions'] 
      : baseColumns;
  }

  loadPlans(): void {
    this.planService.getAllPlans().subscribe({
      next: (plans) => {
        this.plans = plans.sort((a, b) => a.planName.localeCompare(b.planName));
        this.filteredPlans = this.plans;
        this.updatePaginatedPlans();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to load insurance plans', 'Close', { duration: 3000 });
      }
    });
  }

  canManagePlans(): boolean {
    const userRole = this.authService.getCurrentUser()?.role;
    return userRole === UserRole.Admin || userRole === UserRole.InsuranceAgent;
  }

  viewPlan(plan: InsurancePlan): void {
    this.router.navigate(['/insurance-plans', plan.planId]);
  }

  createPlan(): void {
    this.router.navigate(['/insurance-plans/create']);
  }

  editPlan(plan: InsurancePlan): void {
    this.router.navigate(['/insurance-plans/edit', plan.planId]);
  }

  applyFilters(): void {
    this.filteredPlans = this.plans.filter(plan => {
      // Search filter
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        plan.planName.toLowerCase().includes(searchLower) ||
        plan.description?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && plan.isActive) ||
        (this.selectedStatus === 'inactive' && !plan.isActive);

      return matchesSearch && matchesStatus;
    });
    this.pageIndex = 0;
    this.updatePaginatedPlans();
    this.cdr.detectChanges();
  }

  sortData(sort: Sort): void {
    const data = this.filteredPlans.slice();
    if (!sort.active || sort.direction === '') {
      this.filteredPlans = data;
      this.updatePaginatedPlans();
      return;
    }

    this.filteredPlans = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'planName':
          return compare(a.planName, b.planName, isAsc);
        case 'description':
          return compare(a.description || '', b.description || '', isAsc);
        case 'premiumAmount':
          return compare(a.premiumAmount, b.premiumAmount, isAsc);
        case 'coverageLimit':
          return compare(a.coverageLimit, b.coverageLimit, isAsc);
        case 'deductiblePercentage':
          return compare(a.deductiblePercentage, b.deductiblePercentage, isAsc);
        case 'isActive':
          return compare(a.isActive ? 1 : 0, b.isActive ? 1 : 0, isAsc);
        default:
          return 0;
      }
    });
    this.updatePaginatedPlans();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedStatus !== '';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedPlans();
  }

  updatePaginatedPlans(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPlans = this.filteredPlans.slice(startIndex, endIndex);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}