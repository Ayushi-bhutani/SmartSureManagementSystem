import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Payment, 
  CreateRazorpayOrderRequest,
  RazorpayOrderResponse,
  VerifyRazorpayPaymentRequest,
  RecordPaymentRequest,
  RecordFailedPaymentRequest
} from '../models/payment.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/payments`);
  }

  getPaymentsByPolicy(policyId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/policies/${policyId}/payments`);
  }

  getPaymentById(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${paymentId}`);
  }

  // Create mock payment order (backend returns fake order ID)
  createMockPaymentOrder(policyId: string, amount: number): Observable<RazorpayOrderResponse> {
    const data: CreateRazorpayOrderRequest = { policyId, amount };
    return this.http.post<RazorpayOrderResponse>(
      `${this.apiUrl}/policies/${policyId}/payments/razorpay/create-order`, 
      data
    );
  }

  // Verify mock payment (backend always returns success)
  verifyMockPayment(data: VerifyRazorpayPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.apiUrl}/policies/${data.policyId}/payments/razorpay/verify`, 
      data
    );
  }

  recordFailedPayment(data: RecordFailedPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.apiUrl}/policies/${data.policyId}/payments/failed`, 
      data
    );
  }

  recordPayment(data: RecordPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.apiUrl}/policies/${data.policyId}/payments`, 
      data
    );
  }

  /**
   * Simulate a demo payment flow
   * This creates a mock order and immediately verifies it with dummy data
   * No real payment gateway is involved
   */
  processDemoPayment(policyId: string, amount: number): Observable<Payment> {
    // First create the mock order
    return new Observable(observer => {
      this.createMockPaymentOrder(policyId, amount).subscribe({
        next: (orderResponse) => {
          // Generate dummy payment data
          const dummyPaymentData: VerifyRazorpayPaymentRequest = {
            policyId: policyId,
            razorpayOrderId: orderResponse.orderId,
            razorpayPaymentId: `pay_demo_${Date.now()}`,
            razorpaySignature: `sig_demo_${Date.now()}`
          };

          // Verify the mock payment
          this.verifyMockPayment(dummyPaymentData).subscribe({
            next: (payment) => {
              observer.next(payment);
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}
