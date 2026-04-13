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
import { PaymentStatus } from '../models/payment.models';
declare var Razorpay: any;

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
  /**
 * Process payment using Razorpay checkout
 * This will show the actual Razorpay popup with test mode
 */
processDemoPayment(policyId: string, amount: number): Observable<Payment> {
  return new Observable(observer => {
    // Step 1: Create Razorpay order from backend
    this.createMockPaymentOrder(policyId, amount).subscribe({
      next: (orderResponse) => {
        // Step 2: Open Razorpay checkout with the keyId from backend
        const options = {
          key: orderResponse.keyId, // Use keyId from backend response
          amount: orderResponse.amount,
          currency: orderResponse.currency,
          name: 'SmartSure Insurance',
          description: 'Insurance Policy Payment',
          order_id: orderResponse.orderId,
          handler: (response: any) => {
            // Step 3: Verify payment with backend
            const verifyData: VerifyRazorpayPaymentRequest = {
              policyId: policyId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'Razorpay'
            };
            
            this.verifyMockPayment(verifyData).subscribe({
              next: (payment) => {
                observer.next(payment);
                observer.complete();
              },
              error: (err) => {
                observer.error(err);
              }
            });
          },
          prefill: {
            name: 'Test Customer',
            email: 'test@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#667eea'
          },
          modal: {
            ondismiss: () => {
              observer.error(new Error('Payment cancelled by user'));
            }
          },
          config: {
            display: {
              blocks: {
                banks: {
                  name: 'All payment methods',
                  instruments: [
                    {
                      method: 'netbanking'
                    },
                    {
                      method: 'card'
                    },
                    {
                      method: 'upi'
                    }
                  ]
                }
              },
              sequence: ['block.banks'],
              preferences: {
                show_default_blocks: true
              }
            }
          }
        };
        
        const razorpay = new Razorpay(options);
        razorpay.open();
      },
      error: (err) => {
        observer.error(err);
      }
    });
  });
}}