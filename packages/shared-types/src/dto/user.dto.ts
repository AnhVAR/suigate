import { KycStatus } from '../types/enums';

/** Request to update KYC status */
export interface UpdateKycDto {
  status: KycStatus;
}

/** Request to update location verification */
export interface UpdateLocationDto {
  verified: boolean;
}

/** User profile response */
export interface UserProfileDto {
  id: string;
  suiAddress: string;
  kycStatus: KycStatus;
  locationVerified: boolean;
  createdAt: string;
}
