import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, ProcessPaymentDto, CreatePaymentDto } from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://localhost:7075/api/payments';

  constructor(private http: HttpClient) {}

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/my-payments`);
  }

  processPremiumPayment(paymentData: ProcessPaymentDto): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/premium`, paymentData);
  }

  getClaimPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/claim-payments`);
  }

  getPremiumPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/premium-payments`);
  }

  createPayment(paymentData: CreatePaymentDto): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, paymentData);
  }
}
