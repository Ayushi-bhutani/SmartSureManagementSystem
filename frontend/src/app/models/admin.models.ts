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
  reportType: string;
  generatedBy: string;
  generatedAt: string;
  content: string;
  parameters?: any;
}

export interface ReportRequest {
  reportType: string;
  title: string;
  startDate?: string;
  endDate?: string;
  parameters?: any;
}

export interface AuditLog {
  logId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string;
  ipAddress: string;
  timestamp: string;
}

export interface AdminUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  policiesCount?: number;
  claimsCount?: number;
}
