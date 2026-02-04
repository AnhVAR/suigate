import { IsString, IsNotEmpty } from 'class-validator';

export class AdminZkLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string; // Google OAuth JWT id_token from URL hash
}

export class AdminSessionDto {
  userId: string;
  suiAddress: string;
  role: 'admin' | 'support';
  token: string; // Admin session JWT
}

export class AdminTokenPayload {
  sub: string; // userId
  sui_address: string;
  role: 'admin' | 'support';
  iat: number;
  exp: number;
}
