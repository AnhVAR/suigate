import { Injectable, OnModuleInit, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuiTransactionService implements OnModuleInit {
  private signer: any;
  private client: any;
  private enokiClient: any = null;
  private readonly logger = new Logger(SuiTransactionService.name);

  private packageId = '';
  private adminCapId = '';
  private oracleId = '';
  private poolId = '';
  private usdcType = '';

  // RPC retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY_MS = 1000;
  private readonly RPC_TIMEOUT_MS = 30000;

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

      // Initialize Enoki SDK client for sponsored transactions (dynamic import for ESM compat)
      const enokiSecretKey = this.config.get<string>('ENOKI_PRIVATE_KEY')
        || process.env.ENOKI_PRIVATE_KEY;

      if (enokiSecretKey) {
        const { EnokiClient } = await import('@mysten/enoki');
        this.enokiClient = new EnokiClient({
          apiKey: enokiSecretKey,
        });
        this.logger.log('EnokiClient initialized for sponsored transactions');
      } else {
        this.logger.warn('ENOKI_PRIVATE_KEY not configured - sponsorship disabled');
      }
    } catch (error) {
      this.logger.error('Failed to init SuiTransactionService', error);
    }
  }

  /**
   * Get pool USDC balance by reading the pool object's reserve field
   * @returns Balance in USDC (human-readable format)
   */
  private async getPoolBalance(): Promise<number> {
    return this.withRetry(async () => {
      // Query the pool object directly to read its reserve balance
      const poolObject = await this.client.getObject({
        id: this.poolId,
        options: { showContent: true },
      });

      if (!poolObject?.data?.content?.fields) {
        this.logger.warn('Could not read pool object fields');
        return 0;
      }

      // The reserve is a Balance<T> which has a value field
      const reserveValue = poolObject.data.content.fields.reserve;
      const balanceRaw = typeof reserveValue === 'object' ? reserveValue.value : reserveValue;

      // USDC has 6 decimals on Sui
      return Number(balanceRaw || 0) / 1_000_000;
    }, 'getPoolBalance');
  }

  /**
   * Check if pool has sufficient liquidity for the requested amount
   * @param amountUsdc Amount in USDC
   * @throws Error if insufficient liquidity
   */
  private async checkPoolLiquidity(amountUsdc: number): Promise<void> {
    const poolBalance = await this.getPoolBalance();

    if (poolBalance < amountUsdc) {
      const message = `Insufficient pool liquidity: requested ${amountUsdc} USDC, available ${poolBalance.toFixed(6)} USDC`;
      this.logger.error(message);
      throw new Error(message);
    }

    this.logger.log(
      `Pool liquidity check passed: ${amountUsdc} USDC <= ${poolBalance.toFixed(6)} USDC`,
    );
  }

  /** Dispense USDC to user after VND payment confirmed */
  async dispenseUsdc(
    amountUsdc: number,
    recipientAddress: string,
  ): Promise<string> {
    // Pre-check: Verify pool has sufficient liquidity before creating transaction
    await this.checkPoolLiquidity(amountUsdc);

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

  private async signAndExecute(tx: any): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    return this.withRetry(async () => {
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
    }, 'signAndExecute');
  }

  /**
   * Build and sponsor deposit transaction via Enoki SDK
   * Backend builds tx with SuiClient (handles shared objects correctly)
   * @param senderAddress User's wallet address
   * @param amountMist Amount in USDC mist (6 decimals)
   * @returns tx bytes and digest for user to sign
   */
  async sponsorDepositTransaction(
    senderAddress: string,
    amountMist: string,
  ): Promise<{
    txBytesBase64: string;
    digest: string;
  }> {
    if (!this.enokiClient) {
      throw new ServiceUnavailableException('EnokiClient not initialized - check ENOKI_PRIVATE_KEY');
    }

    try {
      const { Transaction } = await import('@mysten/sui/transactions');

      // Get user's USDC coins
      const coins = await this.client.getCoins({
        owner: senderAddress,
        coinType: this.usdcType,
      });

      if (!coins.data?.length) {
        throw new Error('No USDC coins found in wallet');
      }

      // Build transaction
      const tx = new Transaction();
      const amount = BigInt(amountMist);

      // Use object refs for coins (owned objects)
      const coinRefs = coins.data.map((c: any) =>
        tx.objectRef({
          objectId: c.coinObjectId,
          version: c.version,
          digest: c.digest,
        }),
      );

      if (coinRefs.length > 1) {
        tx.mergeCoins(coinRefs[0], coinRefs.slice(1));
      }

      const [depositCoin] = tx.splitCoins(coinRefs[0], [amount]);

      // Pool is SHARED object - use object() not objectRef()
      tx.moveCall({
        target: `${this.packageId}::liquidity_pool::deposit`,
        typeArguments: [this.usdcType],
        arguments: [tx.object(this.poolId), depositCoin],
      });

      // Build with client for proper resolution
      const kindBytes = await tx.build({ client: this.client, onlyTransactionKind: true });
      const txKindBase64 = Buffer.from(kindBytes).toString('base64');

      // Sponsor via Enoki
      const result = await this.enokiClient.createSponsoredTransaction({
        network: 'testnet',
        transactionKindBytes: txKindBase64,
        sender: senderAddress,
        allowedMoveCallTargets: [`${this.packageId}::liquidity_pool::deposit`],
      });
      return {
        txBytesBase64: result.bytes,
        digest: result.digest,
      };
    } catch (error: any) {
      this.logger.error(`Enoki sponsor failed: ${error.message}`);
      throw new ServiceUnavailableException(`Enoki sponsor error: ${error.message}`);
    }
  }

  /**
   * Execute sponsored tx via Enoki SDK after user signs
   * @throws ServiceUnavailableException if Enoki API is unavailable
   */
  async executeEnokiSponsoredTx(
    digest: string,
    userSignature: string,
  ): Promise<{ digest: string; success: boolean }> {

    if (!this.enokiClient) {
      throw new ServiceUnavailableException('EnokiClient not initialized - check ENOKI_PRIVATE_KEY');
    }

    try {
      const result = await this.enokiClient.executeSponsoredTransaction({
        digest,
        signature: userSignature,
      });
      return { digest: result.digest, success: true };
    } catch (error) {
      this.logger.error(`Enoki execute failed: ${error.message}`);
      throw new ServiceUnavailableException(`Enoki execute error: ${error.message}`);
    }
  }

}
