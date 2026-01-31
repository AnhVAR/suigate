import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import {
  UpdateKycDto,
  UpdateLocationDto,
  UserProfileDto,
} from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private supabase: SupabaseService) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const { data, error } = await this.supabase
      .getClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return {
      id: data.id,
      suiAddress: data.sui_address,
      kycStatus: data.kyc_status,
      locationVerified: data.location_verified,
      createdAt: data.created_at,
    };
  }

  async updateKyc(userId: string, dto: UpdateKycDto): Promise<UserProfileDto> {
    // Mock KYC - auto-approve for hackathon
    const status = dto.status === 'pending' ? 'approved' : dto.status;

    const { error } = await this.supabase
      .getClient()
      .from('users')
      .update({ kyc_status: status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      this.logger.error('Failed to update KYC', error);
      throw new Error('Failed to update KYC status');
    }

    return this.getProfile(userId);
  }

  async updateLocation(
    userId: string,
    dto: UpdateLocationDto,
  ): Promise<UserProfileDto> {
    const { error } = await this.supabase
      .getClient()
      .from('users')
      .update({
        location_verified: dto.verified,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      this.logger.error('Failed to update location', error);
      throw new Error('Failed to update location status');
    }

    return this.getProfile(userId);
  }
}
