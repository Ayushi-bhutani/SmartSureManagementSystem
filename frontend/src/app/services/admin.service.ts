import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  DashboardStats, 
  Report, 
  ReportRequest, 
  AuditLog, 
  AdminUser 
} from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  // Reports
  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/reports`);
  }

  getReportById(reportId: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/reports/${reportId}`);
  }

  generateReport(data: ReportRequest): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/reports`, data);
  }

  generatePdfReport(data: ReportRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/reports/pdf`, data, {
      responseType: 'blob'
    });
  }

  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/${reportId}/download`, {
      responseType: 'blob'
    });
  }

  deleteReport(reportId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reports/${reportId}`);
  }

  // Users
  getAllUsers(page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  getUserById(userId: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/users/${userId}`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // Audit Logs
  getAuditLogs(page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get(`${this.apiUrl}/audit-logs`, { params });
  }
}
