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
import { HospitalService } from '../../services/hospital.service';
import { Hospital } from '../../models/hospital';
import { UserRole } from '../../models/user';
import { AuthService } from '../../../../core/authentication/services/auth.service';

@Component({
  selector: 'app-hospitals',
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
  templateUrl: './hospitals.html',
  styleUrls: ['./hospitals.css']
})
export class HospitalsComponent implements OnInit {
  hospitals: Hospital[] = [];
  filteredHospitals: Hospital[] = [];
  paginatedHospitals: Hospital[] = [];
  displayedColumns = ['hospitalName', 'address', 'city', 'phoneNumber', 'isNetworkProvider', 'actions'];
  
  // Filtering 
  searchTerm: string = '';
  selectedNetworkStatus: string = '';
  
  // Pagination properties
  pageSize: number = 5;
  pageIndex: number = 0;

  constructor(
    private hospitalService: HospitalService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.hospitalService.getAllHospitals().subscribe({
      next: (hospitals) => {
        this.hospitals = hospitals.sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
        this.filteredHospitals = this.hospitals;
        this.updatePaginatedHospitals();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to load hospitals', 'Close', { duration: 3000 });
      }
    });
  }

  canManageHospitals(): boolean {
    const userRole = this.authService.getCurrentUser()?.role;
    return userRole === UserRole.Admin || userRole === UserRole.HospitalStaff;
  }

  viewHospital(hospital: Hospital): void {
    this.router.navigate(['/hospitals', hospital.hospitalId]);
  }

  createHospital(): void {
    this.router.navigate(['/hospitals/create']);
  }

  editHospital(hospital: Hospital): void {
    this.router.navigate(['/hospitals/edit', hospital.hospitalId]);
  }

  applyFilters(): void {
    this.filteredHospitals = this.hospitals.filter(hospital => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        hospital.hospitalName.toLowerCase().includes(searchLower) ||
        hospital.city?.toLowerCase().includes(searchLower) ||
        hospital.phoneNumber?.toLowerCase().includes(searchLower);
      const matchesNetworkStatus = !this.selectedNetworkStatus || 
        (this.selectedNetworkStatus === 'network' && hospital.isNetworkProvider) ||
        (this.selectedNetworkStatus === 'non-network' && !hospital.isNetworkProvider);

      return matchesSearch && matchesNetworkStatus;
    });
    this.pageIndex = 0;
    this.updatePaginatedHospitals();
    this.cdr.detectChanges();
  }

  sortData(sort: Sort): void {
    const data = this.filteredHospitals.slice();
    if (!sort.active || sort.direction === '') {
      this.filteredHospitals = data;
      this.updatePaginatedHospitals();
      return;
    }

    this.filteredHospitals = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'hospitalName':
          return compare(a.hospitalName, b.hospitalName, isAsc);
        case 'address':
          return compare(a.address, b.address, isAsc);
        case 'city':
          return compare(a.city || '', b.city || '', isAsc);
        case 'phoneNumber':
          return compare(a.phoneNumber, b.phoneNumber, isAsc);
        case 'isNetworkProvider':
          return compare(a.isNetworkProvider ? 1 : 0, b.isNetworkProvider ? 1 : 0, isAsc);
        default:
          return 0;
      }
    });
    this.updatePaginatedHospitals();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedNetworkStatus = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedNetworkStatus !== '';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedHospitals();
  }

  updatePaginatedHospitals(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHospitals = this.filteredHospitals.slice(startIndex, endIndex);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}