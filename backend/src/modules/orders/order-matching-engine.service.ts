import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { RatesService } from '../rates/rates.service';
import {
  MatchResult,
  SmartSellFill,
  OrderMatchRecord,
} from './dto/order-matching.dto';

/**
 * Order Matching Engine Service
 * Matches buy orders against active smart sell orders using price-time priority.
 * Fills from smart sells first (lowest target_rate), then pool for remainder.
 */
@Injectable()
export class OrderMatchingEngineService {
  private readonly logger = new Logger(OrderMatchingEngineService.name);
  private readonly MAX_MATCHES_PER_ORDER = 50;

  constructor(
    private supabase: SupabaseService,
    private ratesService: RatesService,
  ) {}

  /**
   * Calculate match result for a buy order amount.
   * Does NOT execute - just calculates what would be matched.
   * @param amountUsdc USDC amount buyer wants
   * @returns MatchResult with smart sell fills and pool remainder
   */
  async calculateMatch(amountUsdc: number): Promise<MatchResult> {
    const rates = await this.ratesService.getCurrentRates();
    // Use buyRate for matching: buyer pays buyRate, so smart sells with target <= buyRate are eligible
    const currentRate = rates.buyRate;

    // Find eligible smart sells: target_rate <= buyRate, status = 'processing'
    const eligibleOrders = await this.findEligibleSmartSells(currentRate);

    let remaining = amountUsdc;
    const fills: SmartSellFill[] = [];
    let totalSmartSellVnd = 0;

    for (const order of eligibleOrders) {
      if (remaining <= 0) break;

      const orderRemaining = Number(order.remaining_usdc);
      if (orderRemaining <= 0) continue;

      const fillAmount = Math.min(remaining, orderRemaining);
      const rate = Number(order.target_rate);

      fills.push({
        orderId: order.id,
        escrowObjectId: order.escrow_object_id,
        fillAmount,
        rate,
      });

      totalSmartSellVnd += fillAmount * rate;
      remaining -= fillAmount;
    }

    // Pool handles remainder at current rate
    const poolVnd = remaining * currentRate;

    return {
      smartSellFills: fills,
      poolFill: remaining,
      matchedUsdc: amountUsdc - remaining,
      totalVnd: totalSmartSellVnd + poolVnd,
    };
  }

  /**
   * Find smart sell orders eligible for matching.
   * Orders by target_rate ASC (best price first), then created_at ASC (oldest first).
   * Uses FOR UPDATE lock to prevent race conditions (requires raw SQL).
   */
  private async findEligibleSmartSells(
    currentRate: number,
  ): Promise<any[]> {
    // Use Supabase query - FOR UPDATE lock not available via JS client
    // Race conditions handled at executeMatch level with optimistic locking
    // Only match orders that have escrow_object_id set (on-chain escrow exists)
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select('id, escrow_object_id, remaining_usdc, target_rate, created_at')
      .eq('order_type', 'smart_sell')
      .eq('status', 'processing')
      .gt('remaining_usdc', 0)
      .not('escrow_object_id', 'is', null)
      .lte('target_rate', currentRate)
      .order('target_rate', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(this.MAX_MATCHES_PER_ORDER);

    if (error) {
      this.logger.error('Failed to query eligible smart sells', error);
      return [];
    }

    // Debug: also log total processing smart sells for visibility
    if (!data?.length) {
      const { count } = await this.supabase
        .getClient()
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('order_type', 'smart_sell')
        .eq('status', 'processing')
        .gt('remaining_usdc', 0)
        .not('escrow_object_id', 'is', null);

      this.logger.log(
        `No eligible smart sells at rate ${currentRate}. Total active smart sells: ${count || 0}`,
      );
    } else {
      this.logger.log(
        `Found ${data.length} eligible smart sells for rate ${currentRate}`,
      );
    }

    return data || [];
  }

  /**
   * Execute match fills - update DB records.
   * Called after on-chain partial_fill transactions succeed.
   * @param buyOrderId Buy order being filled
   * @param fill Single smart sell fill to record
   * @param txHash Transaction hash from partial_fill
   */
  async recordMatchFill(
    buyOrderId: string,
    fill: SmartSellFill,
    txHash: string,
  ): Promise<OrderMatchRecord> {
    const amountVnd = fill.fillAmount * fill.rate;

    // Insert order_matches record
    const { data: matchData, error: matchError } = await this.supabase
      .getClient()
      .from('order_matches')
      .insert({
        buy_order_id: buyOrderId,
        sell_order_id: fill.orderId,
        amount_usdc: fill.fillAmount,
        rate: fill.rate,
        amount_vnd: amountVnd,
        tx_hash: txHash,
        status: 'executed',
        vnd_settled: false,
      })
      .select()
      .single();

    if (matchError) {
      this.logger.error('Failed to insert order_matches', matchError);
      throw new Error('Failed to record match');
    }

    // Update sell order filled/remaining amounts
    await this.updateSmartSellFill(fill.orderId, fill.fillAmount);

    this.logger.log(
      `Recorded match: buy=${buyOrderId} sell=${fill.orderId} amount=${fill.fillAmount} USDC`,
    );

    return {
      id: matchData.id,
      buyOrderId: matchData.buy_order_id,
      sellOrderId: matchData.sell_order_id,
      amountUsdc: Number(matchData.amount_usdc),
      rate: Number(matchData.rate),
      amountVnd: Number(matchData.amount_vnd),
      txHash: matchData.tx_hash,
      status: matchData.status,
      vndSettled: matchData.vnd_settled,
      createdAt: matchData.created_at,
    };
  }

  /**
   * Update smart sell order's filled/remaining amounts.
   * Uses atomic RPC function for consistency.
   */
  private async updateSmartSellFill(
    orderId: string,
    fillAmount: number,
  ): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .rpc('update_smart_sell_fill', {
        p_order_id: orderId,
        p_fill_amount: fillAmount,
      });

    if (error) {
      this.logger.error('Failed to update smart sell fill', error);
      throw new Error('Failed to update smart sell fill amounts');
    }

    // Auto-settle fully filled smart sells (in case SQL function doesn't handle it)
    await this.supabase
      .getClient()
      .from('orders')
      .update({ status: 'settled', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('status', 'processing')
      .lte('remaining_usdc', 0);
  }

  /**
   * Get order's remaining USDC (for cancel flow).
   */
  async getOrderRemaining(orderId: string): Promise<number> {
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select('remaining_usdc, amount_usdc')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return 0;
    }

    // If remaining_usdc is null, order hasn't been confirmed yet - use full amount
    return data.remaining_usdc !== null
      ? Number(data.remaining_usdc)
      : Number(data.amount_usdc);
  }

  /**
   * Get pending VND for settled fills (for cancel response).
   */
  async getPendingVnd(orderId: string): Promise<number> {
    const { data, error } = await this.supabase
      .getClient()
      .from('order_matches')
      .select('amount_vnd')
      .eq('sell_order_id', orderId)
      .eq('status', 'executed')
      .eq('vnd_settled', false);

    if (error || !data) {
      return 0;
    }

    return data.reduce((sum, match) => sum + Number(match.amount_vnd), 0);
  }

  /**
   * Get fill history for an order (for UI display).
   */
  async getFillHistory(orderId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('order_matches')
      .select('amount_usdc, rate, amount_vnd, vnd_settled, created_at')
      .eq('sell_order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to get fill history', error);
      return [];
    }

    return (data || []).map((match) => ({
      amountUsdc: Number(match.amount_usdc),
      rate: Number(match.rate),
      amountVnd: Number(match.amount_vnd),
      vndSettled: match.vnd_settled,
      matchedAt: match.created_at,
    }));
  }
}
