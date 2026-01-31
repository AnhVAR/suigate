import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {
  async getBalance() {
    // TODO: Implement get wallet balance from Sui
    return { message: 'Get wallet balance - to be implemented' };
  }
}
