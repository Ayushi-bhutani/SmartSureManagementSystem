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
  userId: string;
  subtypeId: string;
  policyNumber: string;
  status: PolicyStatus;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  coverageAmount: number;
  idv: number;
  approvedClaimsCount: number;
  createdAt: string;
  updatedAt: string;
  insuranceSubtype?: InsuranceSubtype;
  // Extended properties for display
  insuranceTypeName?: string;
  insuredName?: string;
  insuredDOB?: string;
  insuredPhone?: string;
  insuredAddress?: string;
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
  coverageAmount: number;
  idv: number;
  basePremium: number;
  gst: number;
  totalPremium: number;
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
