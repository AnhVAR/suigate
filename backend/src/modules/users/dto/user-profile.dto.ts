import { IsBoolean, IsEnum } from 'class-validator';

export class UpdateKycDto {
  @IsEnum(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';
}

export class UpdateLocationDto {
  @IsBoolean()
  verified: boolean;
}

export class UserProfileDto {
  id: string;
  suiAddress: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  locationVerified: boolean;
  createdAt: string;
}
