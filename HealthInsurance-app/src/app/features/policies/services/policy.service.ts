import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Policy, CreatePolicyDto } from '../models/policy';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private apiUrl = 'https://localhost:7075/api/policies';

  constructor(private http: HttpClient) {}

  private formatDateToString(date: Date | string): string {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getAllPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.apiUrl);
  }

  getMyPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.apiUrl}/my-policies`);
  }

  getPolicyById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.apiUrl}/${id}`);
  }

  createPolicy(policy: CreatePolicyDto): Observable<Policy> {
    const formattedPolicy = {
      ...policy,
      startDate: this.formatDateToString(policy.startDate) as any
    };
    return this.http.post<Policy>(this.apiUrl, formattedPolicy);
  }

  updatePolicy(id: number, policy: any): Observable<Policy> {
    const formattedPolicy = {
      ...policy,
      startDate: this.formatDateToString(policy.startDate) as any,
      endDate: policy.endDate ? this.formatDateToString(policy.endDate) as any : undefined
    };
    return this.http.put<Policy>(`${this.apiUrl}/${id}`, formattedPolicy);
  }

  renewPolicy(id: number): Observable<Policy> {
    return this.http.put<Policy>(`${this.apiUrl}/${id}/renew`, {});
  }

  deletePolicy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}