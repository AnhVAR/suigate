import { Injectable, Logger } from '@nestjs/common';
import { SuiClientService } from '../../common/sui/sui-client.service';
import { SuiTransactionService } from '../../common/sui/sui-transaction.service';
import { RatesService } from '../rates/rates.service';
import { WalletBalanceDto } from './dto/wallet-balance.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private suiClient: SuiClientService,
    private suiTransaction: SuiTransactionService,
    private ratesService: RatesService,
  ) {}

  async getBalance(suiAddress: string): Promise<WalletBalanceDto> {
    const usdcBalance = await this.suiClient.getUsdcBalance(suiAddress);
    const rates = await this.ratesService.getCurrentRates();

    // Calculate VND equivalent using sell rate (what user would get)
    const usdcNum = parseFloat(usdcBalance);
    const vndEquivalent = usdcNum * rates.sellRate;

    return {
      suiAddress,
      usdcBalance,
      usdcBalanceVnd: Math.round(vndEquivalent).toString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getSponsorAddress(): Promise<string> {
    return this.suiTransaction.getSponsorAddress();
  }

  async sponsorTransaction(
    txBytesBase64: string,
    senderAddress: string,
  ): Promise<{
    sponsorSignature: string;
    txBytesWithGas: string;
    sponsorAddress: string;
  }> {
    return this.suiTransaction.sponsorTransaction(txBytesBase64, senderAddress);
  }

  async executeSponsoredTransaction(
    txBytesBase64: string,
    userSignature: string,
    sponsorSignature: string,
  ): Promise<{ digest: string; success: boolean }> {
    return this.suiTransaction.executeSponsoredTransaction(
      txBytesBase64,
      userSignature,
      sponsorSignature,
    );
  }

  async sponsorTransactionKind(
    txKindBase64: string,
    senderAddress: string,
  ): Promise<{
    txBytesBase64: string;
    sponsorSignature: string;
    sponsorAddress: string;
  }> {
    return this.suiTransaction.sponsorTransactionKind(
      txKindBase64,
      senderAddress,
    );
  }
}
