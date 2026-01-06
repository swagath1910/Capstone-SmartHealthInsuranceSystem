import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../core/authentication/services/auth.service';
import { PolicyService } from '../../../policies/services/policy.service';
import { ClaimService } from '../../../claims/services/claim.service';
import { UserService } from '../../../admin/services/user.service';
import { HospitalService } from '../../../admin/services/hospital.service';
import { InsurancePlanService } from '../../../admin/services/insurance-plan.service';
import { User, UserRole } from '../../../admin/models/user';
import { PolicyStatus } from '../../../policies/models/policy';
import { ClaimStatus } from '../../../claims/models/claim';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  hasRouterOutlet = false;
  stats = {
    activePolicies: 0,
    pendingClaims: 0,
    totalUsers: 0,
    adminCount: 0,
    agentCount: 0,
    claimsOfficerCount: 0,
    hospitalStaffCount: 0,
    policyHolderCount: 0,
    totalHospitals: 0,
    totalClaims: 0,
    totalInsurancePlans: 0,
    totalPolicies: 0,
    totalPolicyHolders: 0,
    approvedClaims: 0,
    rejectedClaims: 0,

    inReviewClaims: 0,
    paidClaims: 0
  };

  constructor(
    private authService: AuthService,
    private policyService: PolicyService,
    private claimService: ClaimService,
    private userService: UserService,
    private hospitalService: HospitalService,
    private insurancePlanService: InsurancePlanService,

    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        this.loadStats();
      }
    });
  }

  loadStats(): void {
    if (!this.currentUser) return;

    // Load policies (Insurance Agents only)
    if (this.currentUser.role === UserRole.InsuranceAgent) {
      this.policyService.getAllPolicies().subscribe({
        next: (policies) => {
          this.stats.activePolicies = policies.filter(p => p.status === PolicyStatus.Active).length;
          this.stats.totalPolicies = policies.length;
          // Get unique policy holder IDs
          const uniquePolicyHolders = new Set(policies.map(p => p.userId));
          this.stats.totalPolicyHolders = uniquePolicyHolders.size;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading policies:', err)
      });
    } else if (this.currentUser.role === UserRole.PolicyHolder) {
      this.policyService.getMyPolicies().subscribe({
        next: (policies) => {
          this.stats.activePolicies = policies.filter(p => p.status === PolicyStatus.Active).length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading my policies:', err)
      });
    }
    // Hospital Staff don't need policy stats

    // Load claims (Claims Officers only)
    if (this.currentUser.role === UserRole.ClaimsOfficer) {
      this.claimService.getAllClaims().subscribe({
        next: (claims) => {
          this.stats.pendingClaims = claims.filter(c => 
            c.status === ClaimStatus.Submitted || 
            c.status === ClaimStatus.InReview ||
            c.status === ClaimStatus.Approved
          ).length;
          this.stats.totalClaims = claims.length;
          this.stats.approvedClaims = claims.filter(c => c.status === ClaimStatus.Approved || c.status === ClaimStatus.Paid).length;
          this.stats.rejectedClaims = claims.filter(c => c.status === ClaimStatus.Rejected).length;
          this.stats.inReviewClaims = claims.filter(c => c.status === ClaimStatus.InReview).length;
          this.stats.paidClaims = claims.filter(c => c.status === ClaimStatus.Paid).length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading claims:', err)
      });
    } else if (this.currentUser.role === UserRole.PolicyHolder) {
      this.claimService.getMyClaims().subscribe({
        next: (claims) => {
          this.stats.totalClaims = claims.length;
          this.stats.pendingClaims = claims.filter(c => 
            c.status === ClaimStatus.Submitted || c.status === ClaimStatus.InReview
          ).length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading my claims:', err)
      });
    }
    // Insurance Agent and Hospital Staff don't have claims stats

    // Load user statistics (Admin only)
    if (this.currentUser.role === UserRole.Admin) {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.stats.totalUsers = users.length;
          this.stats.adminCount = users.filter(u => u.role === UserRole.Admin).length;
          this.stats.agentCount = users.filter(u => u.role === UserRole.InsuranceAgent).length;
          this.stats.claimsOfficerCount = users.filter(u => u.role === UserRole.ClaimsOfficer).length;
          this.stats.hospitalStaffCount = users.filter(u => u.role === UserRole.HospitalStaff).length;
          this.stats.policyHolderCount = users.filter(u => u.role === UserRole.PolicyHolder).length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading users:', err)
      });

      this.hospitalService.getAllHospitals().subscribe({
        next: (hospitals) => {
          this.stats.totalHospitals = hospitals.length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading hospitals:', err)
      });

      this.insurancePlanService.getAllPlans().subscribe({
        next: (plans) => {
          this.stats.totalInsurancePlans = plans.length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading insurance plans:', err)
      });
    }
  }
}