export interface InsuranceType {
  typeId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  basePremium?: number; // For display purposes
}

export interface InsuranceSubtype {
  subtypeId: string;
  typeId: string;
  name: string;
  description: string;
  basePremiumRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface Policy {
  policyId: string;
  formattedPolicyId?: string; // Backend computed property (POL-xxxxx)
  userId: string;
  formattedUserId?: string; // Backend computed property (SSUSER-xxxxx)
  subtypeId: string;
  formattedSubtypeId?: string; // Backend computed property (PLAN-xxxxx)
  status: PolicyStatus;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  insuredDeclaredValue: number; // Backend field name
  idv?: number; // Alias for insuredDeclaredValue
  coverageAmount?: number; // Legacy field
  approvedClaimsCount?: number;
  insuranceSubtype?: InsuranceSubtype;
  subtypeName?: string; // From backend
  typeName?: string; // From backend
  nomineeName?: string; // From backend
  nomineeRelation?: string; // From backend
  // Extended properties for display
  insuranceTypeName?: string;
  insuredName?: string;
  insuredDOB?: string;
  insuredPhone?: string;
  insuredAddress?: string;
  // Computed properties for display
  policyNumber?: string; // Alias for formattedPolicyId
  createdAt?: string; // Use startDate as fallback
  updatedAt?: string;
}

export enum PolicyStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Active = 'Active',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
  Terminated = 'Terminated',
  Failed = 'Failed'
}

export interface CreatePolicyRequest {
  subtypeId: string;
  duration: number; // in months
  homeDetail?: HomeDetails;
  vehicleDetail?: VehicleDetails;
  couponCode?: string;
  nomineeName?: string;
  nomineeRelation?: string;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  engineNumber: string;
  chassisNumber: string;
  fuelType: string;
  vehicleType: string;
  seatingCapacity: number;
  purchaseDate: string;
  currentValue: number;
}

export interface HomeDetails {
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  constructionYear: number;
  squareFeet: number;
  numberOfRooms: number;
  hasSecuritySystem: boolean;
  hasFireAlarm: boolean;
  propertyValue: number;
}

export interface PolicyDetail {
  detailId: string;
  policyId: string;
  vehicleDetails?: VehicleDetails;
  homeDetails?: HomeDetails;
}

export interface QuoteResponse {
  subtypeId: string;
  subtypeName: string;
  typeName: string;
  duration: number;
  insuredDeclaredValue: number;
  premiumAmount: number;
  breakdown: string;
}
// Add this interface after QuoteResponse
export interface DisplayQuote {
  basePremium: number;
  gst: number;
  totalPremium: number;
  idv: number;
  startDate: string;
  endDate: string;
}

export interface Discount {
  discountId: string;
  code: string;
  description: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

export interface DiscountCalculation {
  originalPremium: number;
  firstTimeDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  finalPremium: number;
  appliedCouponCode?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
