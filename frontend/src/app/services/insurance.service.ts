import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InsuranceType, InsuranceSubtype } from '../models/policy.models';
import { tap, catchError, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Insurance Types
  getAllTypes(): Observable<InsuranceType[]> {
  console.log('Calling insurance-types URL:', `${this.apiUrl}/insurance-types`);
  return this.http.get<InsuranceType[]>(`${this.apiUrl}/insurance-types`).pipe(
    tap(data => console.log('Insurance types received:', data)),
    catchError(error => {
      console.error('Error fetching insurance types:', error);
      return throwError(() => error);
    })
  );
}

  getTypeById(typeId: string): Observable<InsuranceType> {
    return this.http.get<InsuranceType>(`${this.apiUrl}/insurance-types/${typeId}`);
  }

  createType(data: Partial<InsuranceType>): Observable<InsuranceType> {
    return this.http.post<InsuranceType>(`${this.apiUrl}/insurance-types`, data);
  }

  updateType(typeId: string, data: Partial<InsuranceType>): Observable<any> {
    return this.http.put(`${this.apiUrl}/insurance-types/${typeId}`, data);
  }

  deleteType(typeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/insurance-types/${typeId}`);
  }

  // Insurance Subtypes
  getSubtypesByTypeId(typeId: string): Observable<InsuranceSubtype[]> {
    return this.http.get<InsuranceSubtype[]>(`${this.apiUrl}/insurance-types/${typeId}/subtypes`);
  }

  getAllSubtypes(): Observable<InsuranceSubtype[]> {
    return this.http.get<InsuranceSubtype[]>(`${this.apiUrl}/insurance-subtypes`);
  }

  createSubtype(data: Partial<InsuranceSubtype>): Observable<InsuranceSubtype> {
    return this.http.post<InsuranceSubtype>(`${this.apiUrl}/insurance-subtypes`, data);
  }

  updateSubtype(subtypeId: string, data: Partial<InsuranceSubtype>): Observable<any> {
    return this.http.put(`${this.apiUrl}/insurance-subtypes/${subtypeId}`, data);
  }

  deleteSubtype(subtypeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/insurance-subtypes/${subtypeId}`);
  }
}
