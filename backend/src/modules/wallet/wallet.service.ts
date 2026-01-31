import { Injectable, Logger } from '@nestjs/common';
import { SuiClientService } from '../../common/sui/sui-client.service';
import { RatesService } from '../rates/rates.service';
import { WalletBalanceDto } from './dto/wallet-balance.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private suiClient: SuiClientService,
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
}
