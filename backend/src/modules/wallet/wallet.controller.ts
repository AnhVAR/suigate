import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletBalanceDto } from './dto/wallet-balance.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req): Promise<WalletBalanceDto> {
    return this.walletService.getBalance(req.user.suiAddress);
  }
}
