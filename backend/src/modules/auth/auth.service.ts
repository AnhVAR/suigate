import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { ZkLoginDto, ZkLoginResponseDto } from './dto/zklogin-auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  async zkLogin(dto: ZkLoginDto): Promise<ZkLoginResponseDto> {
    // Decode and verify JWT
    const payload = this.decodeJwt(dto.jwt);

    // Verify issuer (Google or Apple)
    const validIssuers = [
      'https://accounts.google.com',
      'https://appleid.apple.com',
    ];
    if (!validIssuers.includes(payload.iss)) {
      throw new UnauthorizedException('Invalid JWT issuer');
    }

    // Verify audience matches our app
    const expectedAud = payload.iss.includes('google')
      ? this.config.get<string>('auth.googleClientId')
      : this.config.get<string>('auth.appleClientId');
    if (expectedAud && payload.aud !== expectedAud) {
      throw new UnauthorizedException('JWT audience mismatch');
    }

    // Verify expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('JWT expired');
    }

    // For hackathon: trust client-provided address (prover will validate)
    // In production: use jwtToAddress(dto.jwt, dto.salt) from @mysten/sui
    const derivedAddress = dto.suiAddress;

    const client = this.supabase.getClient();

    // Check if user exists by sui_address
    const { data: existingUser } = await client
      .from('users')
      .select('*')
      .eq('sui_address', derivedAddress)
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      userId = existingUser.id;
      this.logger.log(`User login: ${derivedAddress}`);
    } else {
      // Create new user with generated UUID
      userId = crypto.randomUUID();

      const { error } = await client.from('users').insert({
        id: userId,
        sui_address: derivedAddress,
        google_id: payload.iss.includes('google') ? payload.sub : null,
        apple_id: payload.iss.includes('apple') ? payload.sub : null,
        kyc_status: 'pending',
        location_verified: false,
      });

      if (error) {
        this.logger.error('Failed to create user', error);
        throw new Error('Failed to create user');
      }

      isNewUser = true;
      this.logger.log(`New user created: ${derivedAddress}`);
    }

    // Generate access token with user info
    const accessToken = this.generateToken(userId, derivedAddress);

    return {
      userId,
      suiAddress: derivedAddress,
      isNewUser,
      accessToken,
    };
  }

  private decodeJwt(jwt: string): any {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid JWT');
    }
  }

  private generateToken(userId: string, suiAddress: string): string {
    const payload = { sub: userId, sui_address: suiAddress, iat: Date.now() };
    const header = { alg: 'none', typ: 'JWT' };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    return `${headerB64}.${payloadB64}.`;
  }
}
