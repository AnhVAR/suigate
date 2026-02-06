import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SuiTransactionService } from '../../common/sui/sui-transaction.service';
import { OrderMatchingEngineService } from '../orders/order-matching-engine.service';
import {
  SepayWebhookDto,
  SepayWebhookResponse,
} from './dto/sepay-payment-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhookSecret: string;

  constructor(
    private config: ConfigService,
    private supabase: SupabaseService,
    private suiTx: SuiTransactionService,
    private matchingEngine: OrderMatchingEngineService,
  ) {
    this.webhookSecret =
      this.config.get<string>('sepay.webhookSecret') || 'mock-secret';
  }

  async handleSepayWebhook(
    payload: SepayWebhookDto,
    signature: string,
  ): Promise<SepayWebhookResponse> {
    // Verify signature (always verify except for simulate endpoint)
    // Note: simulate endpoint calls this with empty signature but is dev-only
    if (signature && !this.verifySignature(payload, signature)) {
      this.logger.error('Webhook signature verification failed');
      throw new BadRequestException('Invalid webhook signature');
    }

    // Extract reference from content (format: SG-XXXXX)
    const reference = this.extractReference(payload.content);
    if (!reference) {
      this.logger.warn(`No reference found in: ${payload.content}`);
      return { success: true, message: 'No matching order reference' };
    }

    // Find order by reference (don't filter by status yet - need to check processed_at)
    const { data: order, error } = await this.supabase
      .getClient()
      .from('orders')
      .select('*')
      .eq('sepay_reference', reference)
      .single();

    if (error || !order) {
      this.logger.warn(`Order not found for reference: ${reference}`);
      return { success: true, message: 'Order not found' };
    }

    // IDEMPOTENCY CHECK: If order already processed, return success immediately
    if (order.status === 'paid' || order.status === 'settled') {
      this.logger.log(`Order ${order.id} already processed (status=${order.status}), skipping (idempotent)`);
      return { success: true, message: 'Payment already processed' };
    }

    // Only process pending orders
    if (order.status !== 'pending') {
      this.logger.warn(`Order ${order.id} has status ${order.status}, not pending`);
      return { success: true, message: `Order status is ${order.status}` };
    }

    // Verify amount matches
    if (payload.transferAmount !== order.amount_vnd) {
      this.logger.warn(
        `Amount mismatch: expected ${order.amount_vnd}, got ${payload.transferAmount}`,
      );

      // Flag for manual review
      await this.supabase
        .getClient()
        .from('orders')
        .update({ needs_manual_review: true })
        .eq('id', order.id);

      return { success: true, message: 'Amount mismatch, flagged for review' };
    }

    // ATOMIC UPDATE: Mark as paid in single transaction
    // This prevents race conditions from duplicate webhooks
    const { data: updatedOrder, error: updateError } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        status: 'paid',
        sepay_transaction_id: payload.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('status', 'pending') // Only update if still pending (concurrency safety)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      // Another webhook already processed this order
      this.logger.warn(`Order ${order.id} was already processed by another webhook`);
      return { success: true, message: 'Payment already processed by another webhook' };
    }

    this.logger.log(`Order ${order.id} marked as paid via ${reference}`);

    // Dispense USDC via liquidity_pool::dispense()
    await this.dispenseUsdcToUser(updatedOrder);

    return { success: true, message: 'Payment processed' };
  }

  private verifySignature(
    payload: SepayWebhookDto,
    signature: string,
  ): boolean {
    if (!signature) {
      return false;
    }

    const payloadStr = JSON.stringify(payload);
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadStr)
      .digest('hex');

    try {
      // Ensure both buffers are same length for timingSafeEqual
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSig, 'hex');

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (error) {
      this.logger.error('Signature verification error', error);
      return false;
    }
  }

  private extractReference(content: string): string | null {
    const match = content.match(/SG-[A-Z0-9]{5}/);
    return match ? match[0] : null;
  }

  /**
   * Simulate SePay payment for sandbox testing
   * Creates a fake webhook payload and processes it
   */
  async simulatePayment(reference: string): Promise<SepayWebhookResponse> {
    // Allow simulation if ALLOW_PAYMENT_SIMULATION=true (for staging/testing on deployed env)
    const allowSimulation = this.config.get<string>('ALLOW_PAYMENT_SIMULATION') === 'true';
    if (process.env.NODE_ENV === 'production' && !allowSimulation) {
      return { success: false, message: 'Simulation not allowed in production' };
    }

    // Find order by reference
    const { data: order, error } = await this.supabase
      .getClient()
      .from('orders')
      .select('*')
      .eq('sepay_reference', reference)
      .eq('status', 'pending')
      .single();

    if (error || !order) {
      this.logger.warn(`Order not found for simulation: ${reference}`);
      return { success: false, message: 'Order not found or not pending' };
    }

    // Create simulated webhook payload
    const simulatedPayload: SepayWebhookDto = {
      id: Date.now(),
      gateway: 'Simulated_MBBank',
      transactionDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      accountNumber: this.config.get<string>('sepay.accountNumber') || '0123456789',
      subAccount: null,
      code: null,
      content: reference,
      transferType: 'in',
      description: `Simulated payment for ${reference}`,
      transferAmount: order.amount_vnd,
      referenceCode: `SIM-${Date.now()}`,
      accumulated: 0,
    };

    this.logger.log(`Simulating payment for ${reference}: ${order.amount_vnd} VND`);

    // Process using existing webhook handler (skip signature in dev)
    return this.handleSepayWebhook(simulatedPayload, '');
  }

  /**
   * Dispense USDC to user after VND payment confirmed.
   * Uses order matching engine: fills from smart sells first, then pool.
   */
  private async dispenseUsdcToUser(order: any): Promise<void> {
    try {
      // Get user's Sui address
      const { data: user } = await this.supabase
        .getClient()
        .from('users')
        .select('sui_address')
        .eq('id', order.user_id)
        .single();

      if (!user?.sui_address) {
        throw new Error('User has no Sui address');
      }

      const amountUsdc = Number(order.amount_usdc);

      // Calculate match against smart sell order book
      const matchResult = await this.matchingEngine.calculateMatch(amountUsdc);

      this.logger.log(
        `Match result for ${amountUsdc} USDC: ${matchResult.smartSellFills.length} smart sells, ${matchResult.poolFill} from pool`,
      );

      // Execute partial fills from smart sells
      for (const fill of matchResult.smartSellFills) {
        const fillAmountMist = Math.round(fill.fillAmount * 1_000_000);

        try {
          const txDigest = await this.suiTx.partialFill(
            fill.escrowObjectId,
            fillAmountMist,
            user.sui_address,
          );

          // Record match in order_matches table
          await this.matchingEngine.recordMatchFill(order.id, fill, txDigest);

          // Record transaction
          await this.supabase.getClient().from('transactions').insert({
            order_id: order.id,
            tx_hash: txDigest,
            tx_status: 'confirmed',
          });

          this.logger.log(
            `Partial fill: ${fill.fillAmount} USDC from escrow ${fill.escrowObjectId} (tx: ${txDigest})`,
          );
        } catch (fillError) {
          this.logger.error(
            `Failed partial_fill for escrow ${fill.escrowObjectId}`,
            fillError,
          );
          // Mark for manual review but continue with pool fill
          await this.supabase
            .getClient()
            .from('orders')
            .update({ needs_manual_review: true })
            .eq('id', order.id);
        }
      }

      // Dispense remainder from pool
      if (matchResult.poolFill > 0) {
        const txDigest = await this.suiTx.dispenseUsdc(
          matchResult.poolFill,
          user.sui_address,
        );

        // Record transaction
        await this.supabase.getClient().from('transactions').insert({
          order_id: order.id,
          tx_hash: txDigest,
          tx_status: 'confirmed',
        });

        this.logger.log(
          `Pool dispense: ${matchResult.poolFill} USDC to ${user.sui_address} (tx: ${txDigest})`,
        );
      }

      // Update order status to settled
      await this.supabase
        .getClient()
        .from('orders')
        .update({ status: 'settled', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      this.logger.log(
        `Order ${order.id} settled: ${matchResult.matchedUsdc} from smart sells, ${matchResult.poolFill} from pool`,
      );
    } catch (error) {
      this.logger.error(`Failed to dispense USDC for order ${order.id}`, error);

      // Flag for manual review
      await this.supabase
        .getClient()
        .from('orders')
        .update({ needs_manual_review: true, status: 'failed' })
        .eq('id', order.id);

      throw error;
    }
  }
}
