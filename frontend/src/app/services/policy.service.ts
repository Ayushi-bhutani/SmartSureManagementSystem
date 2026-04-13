import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Policy, 
  CreatePolicyRequest, 
  QuoteResponse, 
  PolicyDetail,
  PaginatedResponse,
  VehicleDetails,
  HomeDetails
} from '../models/policy.models';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMyPolicies(page: number = 1, pageSize: number = 100): Observable<Policy[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResponse<Policy>>(`${this.apiUrl}/policies`, { params })
      .pipe(
        map(response => response.items || [])
      );
  }

  getAllPolicies(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Policy>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResponse<Policy>>(`${this.apiUrl}/policies/all`, { params });
  }

  getPolicyById(policyId: string): Observable<Policy> {
    return this.http.get<Policy>(`${this.apiUrl}/policies/${policyId}`);
  }

  getQuote(data: any): Observable<any> {
    return this.http.post<QuoteResponse>(`${this.apiUrl}/policies/quote`, data);
  }

  buyPolicy(data: CreatePolicyRequest): Observable<Policy> {
    return this.http.post<Policy>(`${this.apiUrl}/policies`, data);
  }

  createPolicy(data: CreatePolicyRequest): Observable<Policy> {
    return this.http.post<Policy>(`${this.apiUrl}/policies`, data);
  }

  activatePolicy(policyId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/policies/${policyId}/activate`, {});
  }

  cancelPolicy(policyId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/policies/${policyId}/cancel`, {});
  }

  deletePolicy(policyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/policies/${policyId}`);
  }

  getPolicyDetails(policyId: string): Observable<PolicyDetail> {
    return this.http.get<PolicyDetail>(`${this.apiUrl}/policies/${policyId}/details`);
  }

  savePolicyDetails(policyId: string, details: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/policies/${policyId}/details`, details);
  }

  updatePolicyDetails(policyId: string, details: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/policies/${policyId}/details`, details);
  }

  getPremiumAmount(policyId: string): Observable<{ premiumAmount: number }> {
    return this.http.get<{ premiumAmount: number }>(`${this.apiUrl}/policies/${policyId}/premium`);
  }

  getHomeDetail(policyId: string): Observable<HomeDetails> {
    return this.http.get<HomeDetails>(`${this.apiUrl}/home-details/${policyId}`);
  }

  getVehicleDetail(policyId: string): Observable<VehicleDetails> {
    return this.http.get<VehicleDetails>(`${this.apiUrl}/vehicle-details/${policyId}`);
  }
}
