export interface Notification {
  notificationId: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  policyId?: number;
  claimId?: number;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  PolicyEnrollment = 1,
  PolicyRenewal = 2,
  ClaimStatusUpdate = 3
}

export interface NotificationResponse {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  policyId?: number;
  claimId?: number;
}
