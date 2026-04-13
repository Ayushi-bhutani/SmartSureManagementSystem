export interface Claim {
  claimId: string;
  formattedClaimId?: string; // Backend computed property (CLM-xxxxx)
  policyId: string;
  formattedPolicyId?: string; // Backend computed property (POL-xxxxx)
  userId: string;
  formattedUserId?: string; // Backend computed property (SSUSER-xxxxx)
  claimNumber?: string; // Legacy field
  description: string; // Backend field name
  incidentDescription?: string; // Alias for description
  claimType?: string;
  incidentDate?: string;
  claimAmount: number; // Backend field name
  claimedAmount?: number; // Alias for claimAmount
  approvedAmount?: number;
  status: string;
  rejectionReason?: string;
  isCompletelyDamaged?: boolean;
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
  claimType?: string;
  incidentDate?: string;
  description: string; // Backend field name
  incidentDescription?: string; // Alias
  claimAmount: number; // Backend field name
  claimedAmount?: number; // Alias
  isCompletelyDamaged?: boolean;
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
  oldStatus?: string;
  newStatus?: string;
  status: string;
  notes?: string;
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
