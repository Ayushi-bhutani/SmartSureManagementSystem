export interface Payment {
  paymentId: string;
  policyId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentDate: string;
  createdAt: string;
}

export enum PaymentStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export interface CreateRazorpayOrderRequest {
  policyId: string;
  amount: number;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string; // Changed from razorpayKey to keyId to match backend
  policyId: string;
}

export interface VerifyRazorpayPaymentRequest {
  policyId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod: string; // Added to match backend DTO
}

export interface RecordPaymentRequest {
  policyId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

export interface RecordFailedPaymentRequest {
  policyId: string;
  amount: number;
  reason?: string;
}
