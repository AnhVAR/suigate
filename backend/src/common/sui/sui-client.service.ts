import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Types for dynamic import
type SuiJsonRpcClientType = any;
type GetJsonRpcFullnodeUrlFn = (network: string) => string;

@Injectable()
export class SuiClientService implements OnModuleInit {
  private client: SuiJsonRpcClientType;
  private usdcType: string;
  private readonly logger = new Logger(SuiClientService.name);

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

      this.client = new SuiJsonRpcClient({ url: rpcUrl });
      this.logger.log(`Sui client initialized: ${rpcUrl}`);
    } catch (error) {
      this.logger.error('Failed to initialize Sui client', error);
      throw error;
    }
  }

  async getUsdcBalance(address: string): Promise<string> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      const balance = await this.client.getBalance({
        owner: address,
        coinType: this.usdcType,
      });

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
      const tx = await this.client.getTransactionBlock({
        digest: txHash,
        options: { showEffects: true },
      });
      return tx.effects?.status?.status === 'success';
    } catch (error) {
      this.logger.error(`Failed to verify tx ${txHash}`, error);
      return false;
    }
  }

  getClient(): SuiJsonRpcClientType {
    return this.client;
  }
}
