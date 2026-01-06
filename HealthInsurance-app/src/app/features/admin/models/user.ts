export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: Date;
  role: UserRole;
  isActive: boolean;
  hospitalId?: number;
  hospitalName?: string;
  policyCount?: number;
  claimCount?: number;
  createdAt?: Date;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: Date;
  role: UserRole;
  hospitalId?: number;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: Date;
  role: UserRole;
  hospitalId?: number;
  isActive: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export enum UserRole {
  Admin = 1,
  InsuranceAgent = 2,
  ClaimsOfficer = 3,
  HospitalStaff = 4,
  PolicyHolder = 5
}