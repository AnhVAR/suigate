import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Types for dynamic import
type SuiJsonRpcClientType = any;
type GetJsonRpcFullnodeUrlFn = (network: string) => string;

@Injectable()
export class SuiClientService implements OnModuleInit {
  private client: SuiJsonRpcClientType;
  private usdcType: string;
  private poolId: string;
  private packageId: string;
  private readonly logger = new Logger(SuiClientService.name);

  // RPC retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY_MS = 1000;
  private readonly RPC_TIMEOUT_MS = 30000;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    try {
      // Dynamic import to handle ESM module
      const { SuiJsonRpcClient, getJsonRpcFullnodeUrl } =
        (await import('@mysten/sui/jsonRpc')) as {
          SuiJsonRpcClient: any;
          getJsonRpcFullnodeUrl: GetJsonRpcFullnodeUrlFn;
        };

      const rpcUrl =
        this.config.get<string>('sui.rpcUrl') ||
        getJsonRpcFullnodeUrl('mainnet') ||
        'https://fullnode.mainnet.sui.io';
      this.usdcType = this.config.get<string>('sui.usdcType') || '';
      this.poolId = this.config.get<string>('sui.poolId') || '';
      this.packageId = this.config.get<string>('sui.packageId') || '';

      this.client = new SuiJsonRpcClient({ url: rpcUrl });
      this.logger.log(`Sui client initialized: ${rpcUrl}`);
    } catch (error) {
      this.logger.error('Failed to initialize Sui client', error);
      throw error;
    }
  }

  /**
   * Retry wrapper with exponential backoff
   * @param operation RPC operation to execute
   * @param operationName Name for logging
   * @returns Operation result
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`RPC timeout after ${this.RPC_TIMEOUT_MS}ms`));
          }, this.RPC_TIMEOUT_MS);
        });

        // Race between operation and timeout
        return await Promise.race([operation(), timeoutPromise]);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `${operationName} attempt ${attempt}/${this.MAX_RETRIES} failed: ${lastError.message}`,
        );

        if (attempt < this.MAX_RETRIES) {
          const delay = this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          this.logger.log(`Retrying ${operationName} in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `${operationName} failed after ${this.MAX_RETRIES} attempts`,
    );
    throw lastError!;
  }

  async getUsdcBalance(address: string): Promise<string> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      const balance = await this.withRetry<any>(
        () =>
          this.client.getBalance({
            owner: address,
            coinType: this.usdcType,
          }),
        'getUsdcBalance',
      );

      // USDC has 6 decimals on Sui
      const balanceNum = Number(balance.totalBalance) / 1_000_000;
      return balanceNum.toFixed(6);
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}`, error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const tx = await this.withRetry<any>(
        () =>
          this.client.getTransactionBlock({
            digest: txHash,
            options: { showEffects: true },
          }),
        'verifyTransaction',
      );
      return tx.effects?.status?.status === 'success';
    } catch (error) {
      this.logger.error(`Failed to verify tx ${txHash}`, error);
      return false;
    }
  }

  getClient(): SuiJsonRpcClientType {
    return this.client;
  }

  getPoolId(): string {
    return this.poolId;
  }

  getPackageId(): string {
    return this.packageId;
  }

  getUsdcType(): string {
    return this.usdcType;
  }
}
