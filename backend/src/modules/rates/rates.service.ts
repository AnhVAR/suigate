import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SuiTransactionService } from '../../common/sui/sui-transaction.service';
import { RatesResponseDto } from './dto/exchange-rates.dto';

// CoinGecko API for VND rate (free, no auth needed)
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const SPREAD_BPS = 50; // 0.5% spread

interface CachedRate {
  data: RatesResponseDto;
  expiresAt: number;
}

@Injectable()
export class RatesService implements OnModuleInit {
  private cache: CachedRate | null = null;
  private readonly CACHE_TTL = 60000; // 60 seconds
  private readonly logger = new Logger(RatesService.name);
  private oracleSyncCount = 0; // Track calls to sync oracle every 5 minutes

  constructor(
    private supabase: SupabaseService,
    private suiTx: SuiTransactionService,
  ) {}

  async onModuleInit() {
    await this.refreshRates();
  }

  async getCurrentRates(): Promise<RatesResponseDto> {
    // Return cached if valid
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }

    // Fetch fresh rates
    return this.refreshRates();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async refreshRates(): Promise<RatesResponseDto> {
    try {
      // Get VND/USDC rate directly from CoinGecko
      const midRate = await this.fetchVndRate();

      // Apply spread
      const spreadMultiplier = SPREAD_BPS / 10000;
      const buyRate = midRate * (1 + spreadMultiplier); // User pays more
      const sellRate = midRate * (1 - spreadMultiplier); // User gets less

      const rates: RatesResponseDto = {
        midRate: Math.round(midRate * 100) / 100,
        buyRate: Math.round(buyRate * 100) / 100,
        sellRate: Math.round(sellRate * 100) / 100,
        spreadBps: SPREAD_BPS,
        source: 'coingecko',
        updatedAt: new Date().toISOString(),
      };

      // Cache rates
      this.cache = {
        data: rates,
        expiresAt: Date.now() + this.CACHE_TTL,
      };

      // Store in database for history
      await this.storeRate(rates);

      // Sync to on-chain oracle every 5 minutes (every 5th call)
      this.oracleSyncCount++;
      if (this.oracleSyncCount >= 5) {
        this.oracleSyncCount = 0;
        await this.syncOracleRates(rates);
      }

      this.logger.log(
        `Rates refreshed: mid=${rates.midRate}, buy=${rates.buyRate}, sell=${rates.sellRate}`,
      );
      return rates;
    } catch (error) {
      this.logger.error('Failed to refresh rates', error);

      // Return cached if available, even if expired
      if (this.cache) {
        this.logger.warn('Using stale cached rates');
        return this.cache.data;
      }

      // Fallback to default rate if no cache
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

  private async fetchVndRate(): Promise<number> {
    // CoinGecko: Get USDC price in VND directly
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=usd-coin&vs_currencies=vnd`,
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    // Returns: { "usd-coin": { "vnd": 25000 } }
    return data['usd-coin']?.vnd || 25000; // Fallback to 25000
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
      // Non-critical, just log
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
      // Non-critical for hackathon, just log
    }
  }

  /** Manual trigger for testing oracle sync */
  async triggerOracleSync(): Promise<string> {
    const rates = await this.getCurrentRates();
    await this.syncOracleRates(rates);
    return `Oracle sync triggered: midRate=${Math.round(rates.midRate)}`;
  }
}
