import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import {
  AnalyticsSummary,
  VolumeDataPoint,
  RevenueDataPoint,
  UserGrowthDataPoint,
  KycDistribution,
  OrderBreakdown,
  StatusCounts,
} from './dto/analytics.dto';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getSummary(from: Date, to: Date): Promise<AnalyticsSummary> {
    const supabase = this.supabase.getClient();

    try {
      // Get settled orders for volume calculation
      const { data: settledOrders, error: volumeError } = await supabase
        .from('orders')
        .select('amount_usdc')
        .eq('status', 'settled')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString());

      if (volumeError) throw volumeError;

      const total_volume_usdc = (settledOrders || []).reduce(
        (sum, order) => sum + (order.amount_usdc || 0),
        0,
      );
      const total_revenue_usdc = total_volume_usdc * 0.005; // 0.5% fee

      // Get active users (users with orders in period)
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('orders')
        .select('user_id')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString());

      if (activeUsersError) throw activeUsersError;

      const uniqueUserIds = new Set(
        (activeUsersData || []).map((o) => o.user_id),
      );
      const active_users = uniqueUserIds.size;

      // Get total users count
      const { count: total_users, error: totalUsersError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (totalUsersError) throw totalUsersError;

      // Get pending orders count
      const { count: pending_orders, error: pendingError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get needs_review orders count
      const { count: needs_review_orders, error: reviewError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('needs_manual_review', true);

      if (reviewError) throw reviewError;

      return {
        total_volume_usdc,
        total_revenue_usdc,
        active_users,
        total_users: total_users || 0,
        pending_orders: pending_orders || 0,
        needs_review_orders: needs_review_orders || 0,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to get analytics summary: ${error.message}`,
      );
    }
  }

  async getVolumeData(
    period: 'daily' | 'weekly' | 'monthly',
    from: Date,
    to: Date,
  ): Promise<VolumeDataPoint[]> {
    const supabase = this.supabase.getClient();

    try {
      // Fetch all orders in date range
      const { data: orders, error } = await supabase
        .from('orders')
        .select('order_type, amount_usdc, created_at')
        .eq('status', 'settled')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by period
      const grouped = this.groupByPeriod(orders || [], period);

      return Object.entries(grouped).map(([date, items]) => {
        const buy_volume = items
          .filter((o) => o.order_type === 'buy')
          .reduce((sum, o) => sum + (o.amount_usdc || 0), 0);

        const sell_volume = items
          .filter((o) => ['quick_sell', 'smart_sell'].includes(o.order_type))
          .reduce((sum, o) => sum + (o.amount_usdc || 0), 0);

        return {
          date,
          buy_volume,
          sell_volume,
          total_volume: buy_volume + sell_volume,
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to get volume data: ${error.message}`,
      );
    }
  }

  async getRevenueData(
    period: 'daily' | 'weekly' | 'monthly',
    from: Date,
    to: Date,
  ): Promise<RevenueDataPoint[]> {
    const supabase = this.supabase.getClient();

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('order_type, amount_usdc, created_at')
        .eq('status', 'settled')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const grouped = this.groupByPeriod(orders || [], period);

      return Object.entries(grouped).map(([date, items]) => {
        const buy_fees = items
          .filter((o) => o.order_type === 'buy')
          .reduce((sum, o) => sum + (o.amount_usdc || 0) * 0.005, 0);

        const sell_fees = items
          .filter((o) => ['quick_sell', 'smart_sell'].includes(o.order_type))
          .reduce((sum, o) => sum + (o.amount_usdc || 0) * 0.005, 0);

        return {
          date,
          buy_fees,
          sell_fees,
          total_fees: buy_fees + sell_fees,
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to get revenue data: ${error.message}`,
      );
    }
  }

  async getUserGrowth(
    period: 'daily' | 'weekly' | 'monthly',
    from: Date,
    to: Date,
  ): Promise<UserGrowthDataPoint[]> {
    const supabase = this.supabase.getClient();

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const grouped = this.groupByPeriod(users || [], period);

      let cumulative_users = 0;
      return Object.entries(grouped).map(([date, items]) => {
        const new_users = items.length;
        cumulative_users += new_users;

        return {
          date,
          new_users,
          cumulative_users,
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to get user growth: ${error.message}`,
      );
    }
  }

  async getKycDistribution(): Promise<KycDistribution> {
    const supabase = this.supabase.getClient();

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('kyc_status');

      if (error) throw error;

      const distribution = (users || []).reduce(
        (acc, user) => {
          const status = user.kyc_status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0 } as KycDistribution,
      );

      return distribution;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get KYC distribution: ${error.message}`,
      );
    }
  }

  async getOrderBreakdown(from: Date, to: Date): Promise<OrderBreakdown> {
    const supabase = this.supabase.getClient();

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('order_type, status')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString());

      if (error) throw error;

      const breakdown: OrderBreakdown = {
        buy: this.initStatusCounts(),
        quick_sell: this.initStatusCounts(),
        smart_sell: this.initStatusCounts(),
      };

      (orders || []).forEach((order) => {
        const orderType = order.order_type;
        const status = order.status;

        if (breakdown[orderType] && breakdown[orderType][status] !== undefined) {
          breakdown[orderType][status]++;
        }
      });

      return breakdown;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get order breakdown: ${error.message}`,
      );
    }
  }

  private initStatusCounts(): StatusCounts {
    return {
      pending: 0,
      paid: 0,
      processing: 0,
      settled: 0,
      cancelled: 0,
      failed: 0,
    };
  }

  private groupByPeriod(
    items: Array<{ created_at: string; [key: string]: any }>,
    period: 'daily' | 'weekly' | 'monthly',
  ): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    items.forEach((item) => {
      const date = new Date(item.created_at);
      let key: string;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        // monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  }
}
