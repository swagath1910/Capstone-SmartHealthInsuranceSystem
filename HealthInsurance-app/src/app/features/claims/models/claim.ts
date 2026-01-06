export interface Claim {
  claimId: number;
  claimNumber: string;
  policyId: number;
  policyNumber: string;
  userId: number;
  userName: string;
  hospitalName: string;
  claimAmount: number;
  approvedAmount?: number;
  treatmentDate?: Date;
  medicalNotes?: string;
  notes?: string;
  status: ClaimStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerName?: string;
  rejectionReason?: string;
}

export interface CreateClaimDto {
  policyId: number;
  hospitalId: number;
  claimAmount: number;
  notes?: string;
}

export interface AddMedicalNotesDto {
  medicalNotes: string;
}

export interface ReviewClaimDto {
  status: ClaimStatus;
  approvedAmount?: number;
  rejectionReason?: string;
}

export enum ClaimStatus {
  Submitted = 1,
  InReview = 2,
  Approved = 3,
  Rejected = 4,
  Paid = 5
}