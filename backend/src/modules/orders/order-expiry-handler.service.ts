/**
 * Order Expiry Handler Service
 * Cron job to automatically expire pending orders past their expires_at time
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class OrderExpiryHandlerService {
  private readonly logger = new Logger(OrderExpiryHandlerService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Check for expired orders every minute and mark them as expired
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredOrders() {
    try {
      const now = new Date().toISOString();

      // Find pending orders that have expired
      const { data: expiredOrders, error: selectError } = await this.supabase
        .getClient()
        .from('orders')
        .select('id, order_type, sepay_reference')
        .eq('status', 'pending')
        .lt('expires_at', now);

      if (selectError) {
        this.logger.error('Failed to fetch expired orders', selectError);
        return;
      }

      if (!expiredOrders?.length) return;

      this.logger.log(`Found ${expiredOrders.length} expired orders to process`);

      // Update all expired orders to 'expired' status
      const { error: updateError } = await this.supabase
        .getClient()
        .from('orders')
        .update({
          status: 'expired',
          updated_at: now,
        })
        .eq('status', 'pending')
        .lt('expires_at', now);

      if (updateError) {
        this.logger.error('Failed to update expired orders', updateError);
        return;
      }

      this.logger.log(`Marked ${expiredOrders.length} orders as expired`);
    } catch (error) {
      this.logger.error('Order expiry handler error', error);
    }
  }
}
