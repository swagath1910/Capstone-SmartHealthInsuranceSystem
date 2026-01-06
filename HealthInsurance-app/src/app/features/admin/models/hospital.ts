export interface Hospital {
  hospitalId: number;
  hospitalName: string;
  address: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isNetworkProvider: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateHospitalDto {
  hospitalName: string;
  address: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isNetworkProvider: boolean;
}

export interface UpdateHospitalDto {
  hospitalName: string;
  address: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isNetworkProvider: boolean;
}