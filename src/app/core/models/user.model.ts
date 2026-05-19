export type UserRole = 'regular' | 'merchant' | 'admin' | 'super_admin';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface User {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string | null;
  image?: string | null;
  idCardFront?: string | null;
  idCardBack?: string | null;
  dateOfBirth?: string | null;
  verified?: VerificationStatus;
  role?: UserRole;
  cars?: string[];
  wishlist?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginOtpResponse {
  success: boolean;
  message: string;
  phone: string;
  otp?: string;
  expiresInSeconds: number;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
