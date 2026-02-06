import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { IsString, IsNumber } from 'class-validator';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletBalanceDto } from './dto/wallet-balance.dto';

class SponsorDepositDto {
  @IsString()
  amountMist: string;
}

class SponsorEscrowDto {
  @IsString()
  amountMist: string;

  @IsNumber()
  targetRate: number;

  @IsNumber()
  bankAccountId: number;
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
   * Sponsor deposit transaction - backend builds tx with SuiClient
   * Returns tx bytes and digest for user to sign with zkLogin
   */
  @Post('sponsor-deposit')
  async sponsorDeposit(
    @Request() req,
    @Body() dto: SponsorDepositDto,
  ): Promise<{
    txBytesBase64: string;
    digest: string;
  }> {
    return this.walletService.sponsorDeposit(
      req.user.suiAddress,
      dto.amountMist,
    );
  }

  /**
   * Sponsor escrow creation transaction - backend builds tx with SuiClient
   * Returns tx bytes and digest for user to sign with zkLogin
   */
  @Post('sponsor-escrow')
  async sponsorEscrow(
    @Request() req,
    @Body() dto: SponsorEscrowDto,
  ): Promise<{
    txBytesBase64: string;
    digest: string;
  }> {
    return this.walletService.sponsorEscrow(
      req.user.suiAddress,
      dto.amountMist,
      dto.targetRate,
      dto.bankAccountId,
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
