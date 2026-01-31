import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async zkLogin(data: any) {
    // TODO: Implement zkLogin verification
    return { message: 'zkLogin endpoint - to be implemented' };
  }
}
