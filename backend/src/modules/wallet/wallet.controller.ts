import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { IsString } from 'class-validator';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletBalanceDto } from './dto/wallet-balance.dto';

class SponsorTxKindDto {
  @IsString()
  txKindBase64: string;
}

class ExecuteEnokiSponsoredDto {
  @IsString()
  digest: string;

  @IsString()
  userSignature: string;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req): Promise<WalletBalanceDto> {
    return this.walletService.getBalance(req.user.suiAddress);
  }

  /**
   * Sponsor transaction kind via Enoki SDK
   * Returns tx bytes and digest for user to sign
   */
  @Post('sponsor-tx-kind')
  async sponsorTransactionKind(
    @Request() req,
    @Body() dto: SponsorTxKindDto,
  ): Promise<{
    txBytesBase64: string;
    digest: string;
  }> {
    return this.walletService.sponsorTransactionKind(
      dto.txKindBase64,
      req.user.suiAddress,
    );
  }

  /**
   * Execute Enoki-sponsored transaction after user signs
   */
  @Post('execute-enoki-sponsored')
  async executeEnokiSponsored(
    @Body() dto: ExecuteEnokiSponsoredDto,
  ): Promise<{ digest: string; success: boolean }> {
    return this.walletService.executeEnokiSponsored(
      dto.digest,
      dto.userSignature,
    );
  }
}
