export type CarStatus = 'parked' | 'available' | 'rented' | 'sold';
export type CarVerification = 'unverified' | 'verified';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng' | 'other';
export type Transmission = 'manual' | 'automatic';

export interface Car {
  _id: string;
  owner: string | { _id: string; name?: string; phone?: string };
  make: string;
  model: string;
  year: number;
  vin?: string;
  description?: string;
  price?: number;
  rentalPrice?: number;
  status: CarStatus;
  forSale: boolean;
  forRent: boolean;
  inGarage: boolean;
  images?: string[];

  // Documents
  carteGrise?: string | null;
  customerDocument?: string | null;
  salesCertificate?: string | null;
  idCardFront?: string | null;
  idCardBack?: string | null;

  // Specs
  fuelType?: FuelType | null;
  transmission?: Transmission | null;
  color?: string | null;
  bodyType?: string | null;
  mileage?: number | null;

  // Verification
  verified: CarVerification;
  premiumVerified: boolean;
  flagged: boolean;
  verificationReason?: string | null;
  verificationCheckedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface CarFacets {
  makes: Array<{ make: string; count: number }>;
  models: Array<{ make: string; model: string; count: number }>;
  years: Array<{ year: number; count: number }>;
}

export interface SetVerificationRequest {
  verified?: 'verified' | 'unverified' | 'flagged';
  flagged?: boolean;
  premiumVerified?: boolean;
}
