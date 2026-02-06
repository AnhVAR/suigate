import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SuiTransactionService } from '../../common/sui/sui-transaction.service';
import { RatesResponseDto } from './dto/exchange-rates.dto';

// Free exchange rate API - no rate limits, no API key
const EXCHANGE_API_PRIMARY =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json';
const EXCHANGE_API_FALLBACK =
  'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json';

const SPREAD_BPS = 50; // 0.5% spread

interface CachedRate {
  data: RatesResponseDto;
  expiresAt: number;
}

@Injectable()
export class RatesService implements OnModuleInit {
  private cache: CachedRate | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly logger = new Logger(RatesService.name);

  constructor(
    private supabase: SupabaseService,
    private suiTx: SuiTransactionService,
  ) {}

  async onModuleInit() {
    await this.refreshRates();
  }

  async getCurrentRates(): Promise<RatesResponseDto> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }
    return this.refreshRates();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshRates(): Promise<RatesResponseDto> {
    try {
      const midRate = await this.fetchVndRate();

      const spreadMultiplier = SPREAD_BPS / 10000;
      const buyRate = midRate * (1 + spreadMultiplier);
      const sellRate = midRate * (1 - spreadMultiplier);

      const rates: RatesResponseDto = {
        midRate: Math.round(midRate * 100) / 100,
        buyRate: Math.round(buyRate * 100) / 100,
        sellRate: Math.round(sellRate * 100) / 100,
        spreadBps: SPREAD_BPS,
        source: 'exchange-api',
        updatedAt: new Date().toISOString(),
      };

      // Sync to on-chain oracle FIRST (source of truth)
      await this.syncOracleRates(rates);

      // Cache after oracle sync succeeds
      this.cache = {
        data: rates,
        expiresAt: Date.now() + this.CACHE_TTL,
      };

      await this.storeRate(rates);

      this.logger.log(
        `Rates refreshed: mid=${rates.midRate}, buy=${rates.buyRate}, sell=${rates.sellRate}`,
      );
      return rates;
    } catch (error) {
      this.logger.error('Failed to refresh rates', error);

      if (this.cache) {
        this.logger.warn('Using stale cached rates');
        return this.cache.data;
      }

      const fallbackRate = 25000;
      return {
        midRate: fallbackRate,
        buyRate: fallbackRate * 1.005,
        sellRate: fallbackRate * 0.995,
        spreadBps: SPREAD_BPS,
        source: 'fallback',
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /** Fetch USD/VND rate with primary + fallback URLs */
  private async fetchVndRate(): Promise<number> {
    const urls = [EXCHANGE_API_PRIMARY, EXCHANGE_API_FALLBACK];

    for (const url of urls) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) continue;

        const data = await response.json();
        const vndRate = data?.usd?.vnd;

        if (vndRate && vndRate > 0) {
          return vndRate;
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch from ${url}: ${err.message}`);
      }
    }

    throw new Error('All exchange rate API endpoints failed');
  }

  private async storeRate(rates: RatesResponseDto): Promise<void> {
    try {
      await this.supabase.getClient().from('conversion_rates').insert({
        mid_rate: rates.midRate,
        buy_rate: rates.buyRate,
        sell_rate: rates.sellRate,
        spread_bps: rates.spreadBps,
        source: rates.source,
      });
    } catch (error) {
      this.logger.warn('Failed to store rate history', error);
    }
  }

  /** Update on-chain PriceOracle with current rates */
  private async syncOracleRates(rates: RatesResponseDto): Promise<void> {
    try {
      const midRate = Math.round(rates.midRate);
      const txDigest = await this.suiTx.updateOracleRates(midRate, SPREAD_BPS);
      this.logger.log(`Oracle synced: midRate=${midRate}, tx=${txDigest}`);
    } catch (error) {
      this.logger.error('Failed to sync oracle rates', error);
    }
  }

  /** Manual trigger for testing oracle sync */
  async triggerOracleSync(): Promise<string> {
    const rates = await this.getCurrentRates();
    await this.syncOracleRates(rates);
    return `Oracle sync triggered: midRate=${Math.round(rates.midRate)}`;
  }
}
