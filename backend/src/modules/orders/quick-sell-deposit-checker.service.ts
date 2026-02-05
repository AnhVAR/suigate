/**
 * Quick Sell Deposit Checker Service
 * Cron job to check if users have deposited USDC to pool for quick_sell orders
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SuiClientService } from '../../common/sui/sui-client.service';

@Injectable()
export class QuickSellDepositCheckerService {
  private readonly logger = new Logger(QuickSellDepositCheckerService.name);
  private isProcessing = false;

  constructor(
    private supabase: SupabaseService,
    private suiClient: SuiClientService,
  ) {}

  /**
   * Check for USDC deposits every 30 seconds
   */
  @Cron('*/30 * * * * *')
  async checkDeposits() {
    // Prevent concurrent runs
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find pending quick_sell orders that need deposit verification
      const { data: pendingOrders, error } = await this.supabase
        .getClient()
        .from('orders')
        .select('id, user_id, amount_usdc, created_at')
        .eq('order_type', 'quick_sell')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        this.logger.error('Failed to fetch pending quick_sell orders', error);
        return;
      }

      if (!pendingOrders?.length) return;

      this.logger.log(
        `Checking deposits for ${pendingOrders.length} quick_sell orders`,
      );

      for (const order of pendingOrders) {
        await this.verifyOrderDeposit(order);
      }
    } catch (error) {
      this.logger.error('Deposit checker error', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Verify if deposit was made for a specific order
   */
  private async verifyOrderDeposit(order: {
    id: string;
    user_id: string;
    amount_usdc: number;
  }) {
    try {
      // Check if there's a confirmed transaction for this order
      const { data: tx } = await this.supabase
        .getClient()
        .from('transactions')
        .select('tx_hash, tx_status')
        .eq('order_id', order.id)
        .eq('tx_status', 'confirmed')
        .single();

      if (!tx?.tx_hash) return;

      // Verify transaction on Sui blockchain
      const isValid = await this.suiClient.verifyTransaction(tx.tx_hash);

      if (isValid) {
        // Update order status to 'processing' (deposit confirmed, ready for VND payout)
        const { error: updateError } = await this.supabase
          .getClient()
          .from('orders')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        if (updateError) {
          this.logger.error(
            `Failed to update order ${order.id} status`,
            updateError,
          );
        } else {
          this.logger.log(
            `Order ${order.id}: deposit confirmed, status → processing`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error verifying order ${order.id}`, error);
    }
  }
}
