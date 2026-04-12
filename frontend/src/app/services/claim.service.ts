import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Claim, 
  CreateClaimRequest, 
  UpdateClaimRequest,
  ApproveClaimRequest,
  RejectClaimRequest,
  ClaimDocument,
  ClaimHistory,
  PaginatedResponse
} from '../models/claim.models';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/claims`;

  getMyClaims(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Claim>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResponse<Claim>>(this.apiUrl, { params });
  }

  getAllClaims(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Claim>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResponse<Claim>>(`${this.apiUrl}/all`, { params });
  }

  getClaimById(claimId: string): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${claimId}`);
  }

  createClaim(data: CreateClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(this.apiUrl, data);
  }

  updateClaim(claimId: string, data: UpdateClaimRequest): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${claimId}`, data);
  }

  submitClaim(claimId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${claimId}/submit`, {});
  }

  getClaimHistory(claimId: string): Observable<ClaimHistory[]> {
    return this.http.get<ClaimHistory[]>(`${this.apiUrl}/${claimId}/history`);
  }

  approveClaim(claimId: string, data: ApproveClaimRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${claimId}/approve`, data);
  }

  rejectClaim(claimId: string, data: RejectClaimRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${claimId}/reject`, data);
  }

  getClaimsByPolicy(policyId: string): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/by-policy/${policyId}`);
  }

  updateClaimStatus(claimId: string, status: string, notes?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${claimId}/status`, { status, notes });
  }

  // Document operations
  getDocuments(claimId: string): Observable<ClaimDocument[]> {
    return this.http.get<ClaimDocument[]>(`${this.apiUrl}/${claimId}/documents`);
  }

  uploadDocument(claimId: string, file: File): Observable<ClaimDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ClaimDocument>(`${this.apiUrl}/${claimId}/documents`, formData);
  }

  deleteDocument(claimId: string, docId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${claimId}/documents/${docId}`);
  }
}
