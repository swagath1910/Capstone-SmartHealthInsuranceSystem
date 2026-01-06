import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Reports Policies by Type and Status
export interface PolicyByTypeStatus {
  planType: string;
  status: string;
  count: number;
  totalPremium: number;
}

// Reports Claims by Status and Amount
export interface ClaimsByStatus {
  status: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  approvedAmount: number;
}

export interface ClaimsByHospital {
  hospitalName: string;
  city: string;
  claimCount: number;
  totalAmount: number;
  averageAmount: number;
  approvedClaims: number;
  pendingClaims: number;
}

// Reports Premium vs Payout
export interface PremiumVsPayout {
  month: string;
  year: number;
  monthNumber: number;
  totalPremiums: number;
  totalPayouts: number;
  netBalance: number;
  payoutRatio: number;
}

// Reports High-Value Claims
export interface HighValueClaim {
  claimId: number;
  policyNumber: string;
  patientName: string;
  hospitalName: string;
  city: string;
  claimAmount: number;
  approvedAmount: number | null;
  status: string;
  submittedDate: string;
  reviewedDate: string | null;
  processingDays: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = 'https://localhost:7075/api/reports';

  constructor(private http: HttpClient) { }

  // Reports Policies by Type and Status
  getPoliciesByTypeAndStatus(): Observable<PolicyByTypeStatus[]> {
    return this.http.get<PolicyByTypeStatus[]>(`${this.apiUrl}/policies-by-type-status`);
  }

  // Reports Claims Analysis
  getClaimsByStatusAndAmount(): Observable<ClaimsByStatus[]> {
    return this.http.get<ClaimsByStatus[]>(`${this.apiUrl}/claims-by-status-amount`);
  }

  getClaimsByHospitalDetailed(): Observable<ClaimsByHospital[]> {
    return this.http.get<ClaimsByHospital[]>(`${this.apiUrl}/claims-by-hospital-detailed`);
  }

  // Reports Premium vs Payout
  getPremiumVsPayoutReport(): Observable<PremiumVsPayout[]> {
    return this.http.get<PremiumVsPayout[]>(`${this.apiUrl}/premium-vs-payout`);
  }

  // Reports High-Value Claims
  getHighValueClaims(threshold: number = 50000): Observable<HighValueClaim[]> {
    return this.http.get<HighValueClaim[]>(`${this.apiUrl}/high-value-claims?threshold=${threshold}`);
  }
}
