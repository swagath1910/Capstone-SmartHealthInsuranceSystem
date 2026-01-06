export enum PaymentType {
  Premium = 1,
  ClaimPayout = 2
}

export enum PaymentStatus {
  Pending = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4
}

export interface Payment {
  paymentId: number;
  paymentReference: string;
  policyId?: number;
  policyNumber?: string;
  claimId?: number;
  claimNumber?: string;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  paymentDate: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
}

export interface ProcessPaymentDto {
  policyId: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface CreatePaymentDto {
  policyId?: number;
  claimId?: number;
  amount: number;
  paymentType: PaymentType;
  paymentDate: Date;
  paymentMethod?: string;
  notes?: string;
}