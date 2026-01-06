export interface InsurancePlan {
  planId: number;
  planName: string;
  description?: string;
  premiumAmount: number;
  coverageLimit: number;
  durationInMonths: number;
  deductiblePercentage: number;
  planType: PlanType;
  isActive: boolean;
}

export interface CreateInsurancePlanDto {
  planName: string;
  description?: string;
  premiumAmount: number;
  coverageLimit: number;
  durationInMonths: number;
  deductiblePercentage: number;
  planType: PlanType;
}

export enum PlanType {
  Individual = 1,
  Family = 2,
  Corporate = 3
}