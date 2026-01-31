import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ZkLoginDto {
  @IsString()
  @IsNotEmpty()
  jwt: string; // Google/Apple OAuth JWT

  @IsString()
  @IsNotEmpty()
  suiAddress: string; // Client-derived address

  @IsString()
  @IsNotEmpty()
  salt: string; // User's salt for address derivation

  @IsString()
  @IsOptional()
  provider?: 'google' | 'apple';
}

export class ZkLoginResponseDto {
  userId: string;
  suiAddress: string;
  isNewUser: boolean;
  accessToken: string;
}
