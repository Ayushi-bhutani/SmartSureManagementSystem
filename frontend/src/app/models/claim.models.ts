export interface Claim {
  claimId: string;
  policyId: string;
  userId: string;
  claimNumber: string;
  claimType: string;
  incidentDate: string;
  incidentDescription: string;
  claimedAmount: number;
  approvedAmount?: number;
  status: ClaimStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  policy?: any;
  documents?: ClaimDocument[];
}

export enum ClaimStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Closed = 'Closed'
}

export interface CreateClaimRequest {
  policyId: string;
  claimType: string;
  incidentDate: string;
  incidentDescription: string;
  claimedAmount: number;
}

export interface UpdateClaimRequest {
  claimType: string;
  incidentDate: string;
  incidentDescription: string;
  claimedAmount: number;
}

export interface ApproveClaimRequest {
  approvedAmount: number;
  notes: string;
}

export interface RejectClaimRequest {
  reason: string;
}

export interface ClaimDocument {
  documentId: string;
  claimId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ClaimHistory {
  historyId: string;
  claimId: string;
  status: string;
  notes: string;
  changedBy: string;
  changedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
