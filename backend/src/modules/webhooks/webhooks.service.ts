import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SuiTransactionService } from '../../common/sui/sui-transaction.service';
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
  ) {
    this.webhookSecret =
      this.config.get<string>('sepay.webhookSecret') || 'mock-secret';
  }

  async handleSepayWebhook(
    payload: SepayWebhookDto,
    signature: string,
  ): Promise<SepayWebhookResponse> {
    // Verify signature (mock for hackathon - skip in dev)
    if (process.env.NODE_ENV === 'production') {
      if (!this.verifySignature(payload, signature)) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    // Extract reference from content (format: SG-XXXXX)
    const reference = this.extractReference(payload.content);
    if (!reference) {
      this.logger.warn(`No reference found in: ${payload.content}`);
      return { success: true, message: 'No matching order reference' };
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
      this.logger.warn(`Order not found for reference: ${reference}`);
      return { success: true, message: 'Order not found or not pending' };
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

    // Update order status
    await this.supabase
      .getClient()
      .from('orders')
      .update({
        status: 'paid',
        sepay_transaction_id: payload.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    this.logger.log(`Order ${order.id} marked as paid via ${reference}`);

    // Dispense USDC via liquidity_pool::dispense()
    await this.dispenseUsdcToUser(order);

    return { success: true, message: 'Payment processed' };
  }

  private verifySignature(
    payload: SepayWebhookDto,
    signature: string,
  ): boolean {
    const payloadStr = JSON.stringify(payload);
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadStr)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSig),
      );
    } catch {
      return false;
    }
  }

  private extractReference(content: string): string | null {
    const match = content.match(/SG-[A-Z0-9]{5}/);
    return match ? match[0] : null;
  }

  /** Dispense USDC to user after VND payment confirmed */
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

      // Dispense USDC via smart contract
      const txDigest = await this.suiTx.dispenseUsdc(
        order.amount_usdc,
        user.sui_address,
      );

      // Record transaction
      await this.supabase.getClient().from('transactions').insert({
        order_id: order.id,
        tx_hash: txDigest,
        tx_status: 'confirmed',
      });

      // Update order status to settled
      await this.supabase
        .getClient()
        .from('orders')
        .update({ status: 'settled', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      this.logger.log(
        `Dispensed ${order.amount_usdc} USDC to ${user.sui_address} (tx: ${txDigest})`,
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
