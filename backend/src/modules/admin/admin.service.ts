import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { AdminZkLoginDto, AdminSessionDto } from './dto/admin-auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  async zkLoginAuth(dto: AdminZkLoginDto): Promise<AdminSessionDto> {
    // Decode and verify Google JWT id_token
    const payload = this.decodeJwt(dto.idToken);

    // Verify issuer is Google
    if (payload.iss !== 'https://accounts.google.com') {
      throw new UnauthorizedException('Invalid JWT issuer - must be Google');
    }

    // Verify audience matches Google Client ID
    const expectedAud = this.config.get<string>('auth.googleClientId');
    if (expectedAud && payload.aud !== expectedAud) {
      throw new UnauthorizedException('JWT audience mismatch');
    }

    // Verify expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('JWT expired');
    }

    // Check email whitelist
    const email = payload.email;
    const whitelist = this.config.get<string>('ADMIN_EMAIL_WHITELIST') || '';
    const allowedEmails = whitelist.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

    if (allowedEmails.length > 0 && !allowedEmails.includes(email?.toLowerCase())) {
      this.logger.warn(`Admin login rejected for email: ${email}`);
      throw new UnauthorizedException('Access denied - email not authorized');
    }

    const googleId = payload.sub;
    const client = this.supabase.getClient();

    // Find user by google_id
    const { data: existingUser } = await client
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    let userId: string;
    let suiAddress: string;
    let adminRole: 'admin' | 'support' | null;

    if (existingUser) {
      userId = existingUser.id;
      suiAddress = existingUser.sui_address;
      adminRole = existingUser.admin_role;

      // For hackathon: auto-grant admin role on first admin login
      if (!adminRole) {
        const { error } = await client
          .from('users')
          .update({ admin_role: 'admin' })
          .eq('id', userId);

        if (error) {
          this.logger.error('Failed to grant admin role', error);
        } else {
          adminRole = 'admin';
          this.logger.log(`Granted admin role to user: ${userId}`);
        }
      }
    } else {
      // Create new user with admin role (hackathon simplification)
      userId = crypto.randomUUID();
      // Generate temporary sui_address (will be replaced on mobile zkLogin)
      suiAddress = `0x${crypto.randomBytes(32).toString('hex')}`;
      adminRole = 'admin';

      const { error } = await client.from('users').insert({
        id: userId,
        google_id: googleId,
        sui_address: suiAddress,
        admin_role: adminRole,
        kyc_status: 'pending',
        location_verified: false,
      });

      if (error) {
        this.logger.error('Failed to create admin user', error);
        throw new Error('Failed to create admin user');
      }

      this.logger.log(`New admin user created: ${userId}`);
    }

    // Check if user has admin role
    if (!adminRole) {
      throw new UnauthorizedException(
        'Access denied - admin role required',
      );
    }

    // Generate admin session JWT
    const sessionToken = this.generateAdminToken(userId, suiAddress, adminRole);

    return {
      userId,
      suiAddress,
      role: adminRole,
      token: sessionToken,
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

  private generateAdminToken(
    userId: string,
    suiAddress: string,
    role: 'admin' | 'support',
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 24 * 60 * 60; // 24 hours

    const payload = {
      sub: userId,
      sui_address: suiAddress,
      role,
      iat: now,
      exp,
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const jwtSecret = this.config.get<string>('auth.jwtSecret') || 'secret';

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

    // Create signature using HMAC SHA256
    const signature = crypto
      .createHmac('sha256', jwtSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  verifyAdminToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');

      const [headerB64, payloadB64, signature] = parts;
      const jwtSecret = this.config.get<string>('auth.jwtSecret') || 'secret';

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', jwtSecret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode payload
      const payload = JSON.parse(
        Buffer.from(payloadB64, 'base64').toString('utf8'),
      );

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired admin token');
    }
  }
}
