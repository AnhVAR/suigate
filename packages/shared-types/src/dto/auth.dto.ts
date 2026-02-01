import { AuthProvider } from '../types/enums';

/** Request body for zkLogin authentication */
export interface ZkLoginDto {
  jwt: string;
  suiAddress: string;
  salt: string;
  provider?: AuthProvider;
}

/** Response from zkLogin authentication */
export interface ZkLoginResponseDto {
  userId: string;
  suiAddress: string;
  isNewUser: boolean;
  accessToken: string;
}
