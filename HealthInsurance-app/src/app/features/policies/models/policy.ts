export interface Policy {
  policyId: number;
  policyNumber: string;
  userId: number;
  userName: string;
  userEmail?: string;
  planId: number;
  planName: string;
  startDate: Date;
  endDate: Date;
  premiumPaid: number;
  remainingCoverage: number;
  lastPremiumPaymentDate?: Date | null;
  status: PolicyStatus;
  autoRenew: boolean;
  renewedOn?: Date;
  coverageLimit?: number;
}

export interface CreatePolicyDto {
  userId: number;
  planId: number;
  startDate: Date;
  premiumPaid: number;
  autoRenew: boolean;
}

export enum PolicyStatus {
  Active = 1,
  Expired = 2,
  Suspended = 3,
  Cancelled = 4
}