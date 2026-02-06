/**
 * Admin Settlements Service
 * Handles VND settlement for matched smart sell orders
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import {
  PendingSettlementDto,
  SettlementHistoryDto,
  SettlementHistoryQueryDto,
  SettlementsListResponseDto,
  SettleMatchResponseDto,
} from './dto/admin-settlements.dto';

@Injectable()
export class AdminSettlementsService {
  private readonly logger = new Logger(AdminSettlementsService.name);
  private readonly FEE_RATE = 0.002; // 0.2% fee

  constructor(private supabase: SupabaseService) {}

  /**
   * List pending VND settlements (executed matches not yet settled)
   */
  async listPendingSettlements(): Promise<PendingSettlementDto[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('order_matches')
      .select(
        `
        id,
        sell_order_id,
        amount_usdc,
        rate,
        created_at,
        orders!sell_order_id (
          user_id,
          bank_account_id,
          users (sui_address),
          bank_accounts (
            bank_code,
            account_number_encrypted,
            account_holder
          )
        )
      `,
      )
      .eq('status', 'executed')
      .eq('vnd_settled', false)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('Failed to fetch pending settlements', error);
      throw new BadRequestException(error.message);
    }

    return (data || []).map((match: any) => {
      const amountUsdc = Number(match.amount_usdc);
      const rate = Number(match.rate);
      const grossVnd = amountUsdc * rate;
      const feeVnd = grossVnd * this.FEE_RATE;

      return {
        matchId: match.id,
        sellOrderId: match.sell_order_id,
        sellerUserId: match.orders?.user_id || '',
        sellerAddress: match.orders?.users?.sui_address || '',
        amountUsdc,
        rate,
        grossVnd,
        feeVnd,
        netVnd: grossVnd - feeVnd,
        bankCode: match.orders?.bank_accounts?.bank_code || '',
        accountNumber: this.decryptAccountNumber(
          match.orders?.bank_accounts?.account_number_encrypted,
        ),
        accountHolder: match.orders?.bank_accounts?.account_holder || '',
        matchedAt: match.created_at,
      };
    });
  }

  /**
   * Settle a single match - mark VND as disbursed
   */
  async settleMatch(
    matchId: string,
    adminId: string,
  ): Promise<SettleMatchResponseDto> {
    // Verify match exists and is pending
    const { data: match, error: fetchError } = await this.supabase
      .getClient()
      .from('order_matches')
      .select('id, vnd_settled, amount_usdc, rate, sell_order_id')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) {
      throw new NotFoundException('Match not found');
    }

    if (match.vnd_settled) {
      throw new BadRequestException('Match already settled');
    }

    const now = new Date().toISOString();

    // Update match as settled
    const { error: updateError } = await this.supabase
      .getClient()
      .from('order_matches')
      .update({
        vnd_settled: true,
        status: 'settled',
        settled_by: adminId,
        settled_at: now,
      })
      .eq('id', matchId);

    if (updateError) {
      this.logger.error('Failed to settle match', updateError);
      throw new BadRequestException('Failed to settle match');
    }

    // Check if all matches for this sell order are settled
    await this.checkAndUpdateOrderStatus(match.sell_order_id);

    const grossVnd = Number(match.amount_usdc) * Number(match.rate);
    const netVnd = grossVnd * (1 - this.FEE_RATE);

    this.logger.log(
      `Match ${matchId} settled by admin ${adminId}: ${netVnd.toFixed(0)} VND`,
    );

    return {
      success: true,
      matchId,
      netVnd,
      settledAt: now,
    };
  }

  /**
   * List settlement history (already settled matches)
   */
  async listSettlementHistory(
    query: SettlementHistoryQueryDto,
  ): Promise<SettlementsListResponseDto> {
    const { page = 1, limit = 50, date_from, date_to } = query;
    const offset = (page - 1) * limit;

    let supabaseQuery = this.supabase
      .getClient()
      .from('order_matches')
      .select(
        `
        id,
        sell_order_id,
        amount_usdc,
        rate,
        created_at,
        settled_by,
        settled_at,
        orders!sell_order_id (
          user_id,
          users (sui_address),
          bank_accounts (
            bank_code,
            account_number_encrypted,
            account_holder
          )
        )
      `,
        { count: 'exact' },
      )
      .eq('vnd_settled', true)
      .order('settled_at', { ascending: false });

    if (date_from) {
      supabaseQuery = supabaseQuery.gte('settled_at', date_from);
    }

    if (date_to) {
      supabaseQuery = supabaseQuery.lte('settled_at', date_to);
    }

    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      this.logger.error('Failed to fetch settlement history', error);
      throw new BadRequestException(error.message);
    }

    const settlements: SettlementHistoryDto[] = (data || []).map(
      (match: any) => {
        const amountUsdc = Number(match.amount_usdc);
        const rate = Number(match.rate);
        const grossVnd = amountUsdc * rate;
        const feeVnd = grossVnd * this.FEE_RATE;

        return {
          matchId: match.id,
          sellOrderId: match.sell_order_id,
          sellerUserId: match.orders?.user_id || '',
          sellerAddress: match.orders?.users?.sui_address || '',
          amountUsdc,
          rate,
          grossVnd,
          feeVnd,
          netVnd: grossVnd - feeVnd,
          bankCode: match.orders?.bank_accounts?.bank_code || '',
          accountNumber: this.decryptAccountNumber(
            match.orders?.bank_accounts?.account_number_encrypted,
          ),
          accountHolder: match.orders?.bank_accounts?.account_holder || '',
          matchedAt: match.created_at,
          settledBy: match.settled_by,
          settledAt: match.settled_at,
        };
      },
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      settlements,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Check if all matches for an order are settled, update order status
   */
  private async checkAndUpdateOrderStatus(orderId: string): Promise<void> {
    // Count unsettled matches for this order
    const { count } = await this.supabase
      .getClient()
      .from('order_matches')
      .select('id', { count: 'exact', head: true })
      .eq('sell_order_id', orderId)
      .eq('vnd_settled', false);

    // If no unsettled matches and order has no remaining USDC, mark as settled
    if (count === 0) {
      const { data: order } = await this.supabase
        .getClient()
        .from('orders')
        .select('remaining_usdc, status')
        .eq('id', orderId)
        .single();

      // Only settle if no remaining balance (fully filled or cancelled)
      if (order && (order.remaining_usdc === 0 || order.remaining_usdc === null)) {
        await this.supabase
          .getClient()
          .from('orders')
          .update({
            status: 'settled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        this.logger.log(`Order ${orderId} fully settled`);
      }
    }
  }

  /**
   * Decrypt bank account number for admin display
   * TODO: Implement proper decryption based on your encryption scheme
   */
  private decryptAccountNumber(encrypted: string | null): string {
    if (!encrypted) return '';
    // For MVP: account numbers stored as-is or base64 encoded
    // In production: use proper encryption/decryption
    try {
      return Buffer.from(encrypted, 'base64').toString('utf-8');
    } catch {
      return encrypted; // Return as-is if not base64
    }
  }
}
