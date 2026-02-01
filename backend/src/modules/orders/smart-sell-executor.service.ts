import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SuiTransactionService } from '../../common/sui/sui-transaction.service';
import { RatesService } from '../rates/rates.service';

@Injectable()
export class SmartSellExecutorService {
  private readonly logger = new Logger(SmartSellExecutorService.name);

  constructor(
    private supabase: SupabaseService,
    private suiTx: SuiTransactionService,
    private ratesService: RatesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndExecuteEscrows() {
    try {
      const rates = await this.ratesService.getCurrentRates();
      const currentRate = rates.sellRate;

      // Find pending smart_sell orders where target_rate <= current_rate
      const { data: orders } = await this.supabase
        .getClient()
        .from('orders')
        .select('*, users!inner(sui_address)')
        .eq('order_type', 'smart_sell')
        .eq('status', 'pending')
        .not('escrow_object_id', 'is', null)
        .lte('target_rate', currentRate);

      if (!orders?.length) return;

      this.logger.log(`Found ${orders.length} escrows ready to execute`);

      for (const order of orders) {
        await this.executeOrder(order, currentRate);
      }
    } catch (error) {
      this.logger.error('Smart sell executor error', error);
    }
  }

  private async executeOrder(order: any, currentRate: number) {
    try {
      // Execute escrow on-chain - USDC goes to platform for VND disbursement
      const platformAddress =
        '0xcb4bd77a35d80ef94eaf8a2c5dee82052e358626b06bee1154570152c185e5d8';

      const txDigest = await this.suiTx.executeEscrow(
        order.escrow_object_id,
        platformAddress,
      );

      // Record transaction
      await this.supabase.getClient().from('transactions').insert({
        order_id: order.id,
        tx_hash: txDigest,
        tx_status: 'confirmed',
      });

      // Calculate VND amount at execution rate
      const amountVnd = order.amount_usdc * currentRate;

      // Update order to processing (awaiting VND disbursement)
      await this.supabase
        .getClient()
        .from('orders')
        .update({
          status: 'processing',
          rate: currentRate,
          amount_vnd: amountVnd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      this.logger.log(
        `Executed escrow for order ${order.id}: rate=${currentRate}, vnd=${amountVnd}`,
      );

      // TODO: Trigger VND disbursement to user's bank account
    } catch (error) {
      this.logger.error(`Failed to execute order ${order.id}`, error);

      await this.supabase
        .getClient()
        .from('orders')
        .update({ needs_manual_review: true })
        .eq('id', order.id);
    }
  }
}
