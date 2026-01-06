import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hospital } from '../models/hospital';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private apiUrl = 'https://localhost:7075/api/hospitals';

  constructor(private http: HttpClient) {}

  getAllHospitals(): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(this.apiUrl);
  }

  getNetworkProviders(): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(`${this.apiUrl}/network-providers`);
  }

  getHospitalById(id: number): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.apiUrl}/${id}`);
  }

  createHospital(hospital: Hospital): Observable<Hospital> {
    return this.http.post<Hospital>(this.apiUrl, hospital);
  }

  updateHospital(id: number, hospital: Hospital): Observable<Hospital> {
    return this.http.put<Hospital>(`${this.apiUrl}/${id}`, hospital);
  }
}