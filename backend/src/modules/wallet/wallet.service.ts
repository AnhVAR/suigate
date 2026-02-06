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

  /**
   * Sponsor deposit transaction - backend builds tx with SuiClient
   * Returns tx bytes and digest for user to sign with zkLogin
   */
  async sponsorDeposit(
    senderAddress: string,
    amountMist: string,
  ): Promise<{
    txBytesBase64: string;
    digest: string;
  }> {
    return this.suiTransaction.sponsorDepositTransaction(
      senderAddress,
      amountMist,
    );
  }

  /**
   * Execute Enoki-sponsored transaction after user signs
   */
  async executeEnokiSponsored(
    digest: string,
    userSignature: string,
  ): Promise<{ digest: string; success: boolean }> {
    return this.suiTransaction.executeEnokiSponsoredTx(digest, userSignature);
  }
}
