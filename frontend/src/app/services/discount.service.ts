import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Discount, DiscountCalculation } from '../models/policy.models';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/discounts`;

  getAllDiscounts(): Observable<Discount[]> {
    return this.http.get<Discount[]>(this.apiUrl);
  }

  getDiscountById(id: string): Observable<Discount> {
    return this.http.get<Discount>(`${this.apiUrl}/${id}`);
  }

  createDiscount(data: Partial<Discount>): Observable<Discount> {
    return this.http.post<Discount>(this.apiUrl, data);
  }

  updateDiscount(id: string, data: Partial<Discount>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteDiscount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  calculateDiscount(originalPremium: number, couponCode?: string): Observable<DiscountCalculation> {
    return this.http.post<DiscountCalculation>(`${this.apiUrl}/calculate`, {
      originalPremium,
      couponCode
    });
  }
}
