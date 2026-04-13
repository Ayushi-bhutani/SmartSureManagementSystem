export interface DashboardStats {
  totalUsers: number;
  totalPolicies: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  activePolicies: number;
  totalRevenue: number;
}

export interface Report {
  reportId: string;
  title: string;
  reportName?: string; // Alias for title
  reportType: string;
  generatedBy: string;
  generatedAt: string;
  content: string;
  parameters?: any;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface ReportRequest {
  reportType: string;
  title?: string;
  reportName?: string;
  startDate?: string;
  endDate?: string;
  format?: string;
  parameters?: any;
  options?: any;
}

export interface AuditLog {
  logId: string;
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  description?: string;
  changes?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AdminUser {
  userId: string;
  formattedUserId?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isEmailVerified?: boolean;
  createdAt: string;
  policiesCount?: number;
  claimsCount?: number;
}
