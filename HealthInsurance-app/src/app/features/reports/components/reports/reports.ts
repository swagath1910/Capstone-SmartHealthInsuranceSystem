import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { ReportsService, PolicyByTypeStatus, ClaimsByStatus, ClaimsByHospital, PremiumVsPayout, HighValueClaim } from '../../services/reports.service';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of, forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    BaseChartDirective
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Single loading state
  isLoading = true;
  
  // Data arrays
  policiesData: PolicyByTypeStatus[] = [];
  claimsStatusData: ClaimsByStatus[] = [];
  claimsHospitalData: ClaimsByHospital[] = [];
  premiumPayoutData: PremiumVsPayout[] = [];
  highValueClaimsData: HighValueClaim[] = [];
  
  // Table columns
  compactHighValueColumns: string[] = ['claimId', 'patientName', 'hospitalName', 'claimAmount', 'status', 'processingDays'];

  // Chart configurations
  policyChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  policyChartType: ChartType = 'doughnut';
  
  claimsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  claimsChartType: ChartType = 'bar';
  
  premiumChartData: ChartData<'line'> = { labels: [], datasets: [] };
  premiumChartType: ChartType = 'line';
  
  hospitalChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  hospitalChartType: ChartType = 'pie';

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    datasets: {
      bar: {
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    }
  };

  premiumChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  getHighValueClaims(): number {
    return this.highValueClaimsData.length;
  }

  constructor(private reportsService: ReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAllReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllReports(): void {
    this.isLoading = true;
    
    const reports$ = forkJoin({
      policies: this.reportsService.getPoliciesByTypeAndStatus().pipe(
        timeout(5000),
        catchError(() => of([]))
      ),
      claimsStatus: this.reportsService.getClaimsByStatusAndAmount().pipe(
        timeout(5000),
        catchError(() => of([]))
      ),
      claimsHospital: this.reportsService.getClaimsByHospitalDetailed().pipe(
        timeout(5000),
        catchError(() => of([]))
      ),
      premiumPayout: this.reportsService.getPremiumVsPayoutReport().pipe(
        timeout(5000),
        catchError(() => of([]))
      ),
      highValueClaims: this.reportsService.getHighValueClaims(10000).pipe(
        timeout(5000),
        catchError(() => of([]))
      )
    });

    reports$.pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.policiesData = data.policies;
        this.claimsStatusData = data.claimsStatus;
        this.claimsHospitalData = data.claimsHospital;
        this.premiumPayoutData = data.premiumPayout;
        this.highValueClaimsData = data.highValueClaims;
        
        this.createAllCharts();
      },
      error: (error) => {
        console.error('Error loading reports:', error);
      }
    });
  }

  private createAllCharts(): void {
    this.createPolicyChart(this.policiesData);
    this.createClaimsChart(this.claimsStatusData);
    this.createPremiumChart(this.premiumPayoutData);
    this.createHospitalChart(this.claimsHospitalData);
  }

  private createPolicyChart(data: PolicyByTypeStatus[]): void {
    if (!data || data.length === 0) {
      this.policyChartData = { labels: [], datasets: [] };
      return;
    }
    
    const labels = data.map(item => `${item.planType} (${item.status})`);
    const counts = data.map(item => item.count);
    
    this.policyChartData = {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  private createClaimsChart(data: ClaimsByStatus[]): void {
    if (!data || data.length === 0) {
      this.claimsChartData = { labels: [], datasets: [] };
      return;
    }
    
    const labels = data.map(item => item.status);
    const counts = data.map(item => item.count);
    const amounts = data.map(item => item.totalAmount);
    
    this.claimsChartData = {
      labels,
      datasets: [
        {
          label: 'Count',
          data: counts,
          backgroundColor: '#667eea',
          yAxisID: 'y'
        },
        {
          label: 'Amount',
          data: amounts,
          backgroundColor: '#764ba2',
          yAxisID: 'y1'
        }
      ]
    };
  }

  private createPremiumChart(data: PremiumVsPayout[]): void {
    if (!data || data.length === 0) {
      this.premiumChartData = { labels: [], datasets: [] };
      return;
    }
    
    const labels = data.map(item => item.month);
    const premiums = data.map(item => item.totalPremiums);
    const payouts = data.map(item => item.totalPayouts);
    
    this.premiumChartData = {
      labels,
      datasets: [
        {
          label: 'Premium',
          data: premiums,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        },
        {
          label: 'Payout',
          data: payouts,
          borderColor: '#764ba2',
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  private createHospitalChart(data: ClaimsByHospital[]): void {
    if (!data || data.length === 0) {
      this.hospitalChartData = { labels: [], datasets: [] };
      return;
    }
    
    const topHospitals = data.slice(0, 5);
    const labels = topHospitals.map(item => item.hospitalName);
    const amounts = topHospitals.map(item => item.totalAmount);
    
    this.hospitalChartData = {
      labels,
      datasets: [{
        data: amounts,
        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }
}
