import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { IsString } from 'class-validator';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletBalanceDto } from './dto/wallet-balance.dto';

class SponsorTransactionDto {
  @IsString()
  txBytesBase64: string;
}

class ExecuteSponsoredDto {
  @IsString()
  txBytesBase64: string;

  @IsString()
  userSignature: string;

  @IsString()
  sponsorSignature: string;
}

class BuildSponsoredDepositDto {
  @IsString()
  amountMist: string;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req): Promise<WalletBalanceDto> {
    return this.walletService.getBalance(req.user.suiAddress);
  }

  @Get('sponsor-address')
  async getSponsorAddress(): Promise<{ address: string }> {
    const address = await this.walletService.getSponsorAddress();
    return { address };
  }

  @Post('sponsor-transaction')
  async sponsorTransaction(
    @Request() req,
    @Body() dto: SponsorTransactionDto,
  ): Promise<{
    sponsorSignature: string;
    txBytesWithGas: string;
    sponsorAddress: string;
  }> {
    return this.walletService.sponsorTransaction(
      dto.txBytesBase64,
      req.user.suiAddress,
    );
  }

  @Post('execute-sponsored')
  async executeSponsoredTransaction(
    @Body() dto: ExecuteSponsoredDto,
  ): Promise<{ digest: string; success: boolean }> {
    return this.walletService.executeSponsoredTransaction(
      dto.txBytesBase64,
      dto.userSignature,
      dto.sponsorSignature,
    );
  }

  @Post('build-sponsored-deposit')
  async buildSponsoredDeposit(
    @Request() req,
    @Body() dto: BuildSponsoredDepositDto,
  ): Promise<{
    txBytesBase64: string;
    sponsorSignature: string;
    sponsorAddress: string;
  }> {
    return this.walletService.buildSponsoredDeposit(
      req.user.suiAddress,
      dto.amountMist,
    );
  }
}
