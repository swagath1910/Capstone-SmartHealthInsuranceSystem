import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsurancePlan, CreateInsurancePlanDto } from '../models/insurance-plan';

@Injectable({
  providedIn: 'root'
})
export class InsurancePlanService {
  private apiUrl = 'https://localhost:7075/api/insuranceplans';

  constructor(private http: HttpClient) {}

  getAllPlans(): Observable<InsurancePlan[]> {
    return this.http.get<InsurancePlan[]>(this.apiUrl);
  }

  getActivePlans(): Observable<InsurancePlan[]> {
    return this.http.get<InsurancePlan[]>(`${this.apiUrl}/active`);
  }

  getPlanById(id: number): Observable<InsurancePlan> {
    return this.http.get<InsurancePlan>(`${this.apiUrl}/${id}`);
  }

  createPlan(plan: CreateInsurancePlanDto): Observable<InsurancePlan> {
    return this.http.post<InsurancePlan>(this.apiUrl, plan);
  }

  updatePlan(id: number, plan: CreateInsurancePlanDto): Observable<InsurancePlan> {
    return this.http.put<InsurancePlan>(`${this.apiUrl}/${id}`, plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}