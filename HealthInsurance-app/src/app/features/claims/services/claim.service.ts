import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Claim, CreateClaimDto, ReviewClaimDto, AddMedicalNotesDto } from '../models/claim';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private apiUrl = 'https://localhost:7075/api/claims';

  constructor(private http: HttpClient) {}

  getAllClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.apiUrl);
  }

  getMyClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/my-claims`);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  createClaim(claim: CreateClaimDto): Observable<Claim> {
    return this.http.post<Claim>(this.apiUrl, claim);
  }

  reviewClaim(id: number, review: ReviewClaimDto): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${id}/review`, review);
  }

  getHospitalClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/hospital-claims`);
  }

  getClaimsPendingReview(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/pending-review`);
  }

  addMedicalNotes(id: number, medicalNotes: AddMedicalNotesDto): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${id}/add-medical-notes`, medicalNotes);
  }

  markAsPaid(id: number): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${id}/mark-paid`, {});
  }

  deleteClaimsByPolicy(policyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/by-policy/${policyId}`);
  }
}