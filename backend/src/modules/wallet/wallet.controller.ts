import { Controller, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance() {
    // TODO: Implement wallet balance retrieval
    return this.walletService.getBalance();
  }
}
