import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuiTransactionService implements OnModuleInit {
  private signer: any;
  private client: any;
  private readonly logger = new Logger(SuiTransactionService.name);

  private packageId = '';
  private adminCapId = '';
  private oracleId = '';
  private poolId = '';
  private usdcType = '';

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    try {
      // Use same import pattern as sui-client.service.ts
      const { SuiJsonRpcClient } = (await import('@mysten/sui/jsonRpc')) as any;
      const { Ed25519Keypair } = (await import(
        '@mysten/sui/keypairs/ed25519'
      )) as any;

      const rpcUrl =
        this.config.get<string>('sui.rpcUrl') ||
        'https://fullnode.testnet.sui.io';
      this.client = new SuiJsonRpcClient({ url: rpcUrl });

      const secretKey = this.config.get<string>('sui.adminSecretKey');
      if (secretKey) {
        this.signer = Ed25519Keypair.fromSecretKey(secretKey);
        this.logger.log(`Signer initialized: ${this.signer.toSuiAddress()}`);
      }

      this.packageId = this.config.get<string>('sui.packageId') || '';
      this.adminCapId = this.config.get<string>('sui.adminCapId') || '';
      this.oracleId = this.config.get<string>('sui.oracleId') || '';
      this.poolId = this.config.get<string>('sui.poolId') || '';
      this.usdcType = this.config.get<string>('sui.usdcType') || '';
    } catch (error) {
      this.logger.error('Failed to init SuiTransactionService', error);
    }
  }

  /** Dispense USDC to user after VND payment confirmed */
  async dispenseUsdc(
    amountUsdc: number,
    recipientAddress: string,
  ): Promise<string> {
    const { Transaction } = await import('@mysten/sui/transactions');

    const tx = new Transaction();
    const amountMicro = Math.floor(amountUsdc * 1_000_000);

    tx.moveCall({
      target: `${this.packageId}::liquidity_pool::dispense`,
      arguments: [
        tx.object(this.adminCapId),
        tx.object(this.poolId),
        tx.pure.u64(amountMicro),
        tx.pure.address(recipientAddress),
      ],
      typeArguments: [this.usdcType],
    });

    return this.signAndExecute(tx);
  }

  /** Update on-chain oracle rates */
  async updateOracleRates(
    midRate: number,
    spreadBps: number,
  ): Promise<string> {
    const { Transaction } = await import('@mysten/sui/transactions');

    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::price_oracle::update_rates`,
      arguments: [
        tx.object(this.adminCapId),
        tx.object(this.oracleId),
        tx.pure.u64(midRate),
        tx.pure.u64(spreadBps),
        tx.object('0x6'),
      ],
    });

    return this.signAndExecute(tx);
  }

  /** Execute escrow when rate target met */
  async executeEscrow(
    escrowId: string,
    recipientAddress: string,
  ): Promise<string> {
    const { Transaction } = await import('@mysten/sui/transactions');

    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::escrow::execute_escrow`,
      arguments: [
        tx.object(this.adminCapId),
        tx.object(escrowId),
        tx.object(this.oracleId),
        tx.object('0x6'),
        tx.pure.address(recipientAddress),
      ],
      typeArguments: [this.usdcType],
    });

    return this.signAndExecute(tx);
  }

  private async signAndExecute(tx: any): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const result = await this.client.signAndExecuteTransaction({
      transaction: tx,
      signer: this.signer,
      options: { showEffects: true },
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Transaction failed: ${result.effects?.status?.error}`);
    }

    this.logger.log(`Transaction executed: ${result.digest}`);
    return result.digest;
  }
}
