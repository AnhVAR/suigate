import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import {
  AdminUsersQueryDto,
  AdminUserDto,
  AdminUserDetailDto,
  AdminUsersResponse,
  UpdateKycDto,
  LockUserDto,
  BankAccountDto,
  OrderDto,
} from './dto/admin-users.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listUsers(query: AdminUsersQueryDto): Promise<AdminUsersResponse> {
    const supabase = this.supabaseService.getClient();
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    // Build base query with aggregates
    let countQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('users')
      .select(`
        id,
        sui_address,
        google_id,
        kyc_status,
        location_verified,
        is_locked,
        locked_at,
        lock_reason,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (query.kyc_status) {
      countQuery = countQuery.eq('kyc_status', query.kyc_status);
      dataQuery = dataQuery.eq('kyc_status', query.kyc_status);
    }

    if (query.location_verified !== undefined) {
      countQuery = countQuery.eq('location_verified', query.location_verified);
      dataQuery = dataQuery.eq('location_verified', query.location_verified);
    }

    if (query.is_locked !== undefined) {
      countQuery = countQuery.eq('is_locked', query.is_locked);
      dataQuery = dataQuery.eq('is_locked', query.is_locked);
    }

    if (query.date_from) {
      countQuery = countQuery.gte('created_at', query.date_from);
      dataQuery = dataQuery.gte('created_at', query.date_from);
    }

    if (query.date_to) {
      countQuery = countQuery.lte('created_at', query.date_to);
      dataQuery = dataQuery.lte('created_at', query.date_to);
    }

    if (query.search) {
      const searchPattern = `%${query.search}%`;
      countQuery = countQuery.or(
        `sui_address.ilike.${searchPattern},google_id.ilike.${searchPattern}`,
      );
      dataQuery = dataQuery.or(
        `sui_address.ilike.${searchPattern},google_id.ilike.${searchPattern}`,
      );
    }

    // Execute count query
    const { count, error: countError } = await countQuery;
    if (countError) {
      throw new BadRequestException(`Failed to count users: ${countError.message}`);
    }

    // Execute data query with pagination
    const { data: users, error: dataError } = await dataQuery
      .range(offset, offset + limit - 1);

    if (dataError) {
      throw new BadRequestException(`Failed to fetch users: ${dataError.message}`);
    }

    // Fetch aggregates for each user
    const usersWithAggregates: AdminUserDto[] = await Promise.all(
      (users || []).map(async (user) => {
        // Count orders
        const { count: orderCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Sum total volume
        const { data: volumeData } = await supabase
          .from('orders')
          .select('amount_usdc')
          .eq('user_id', user.id)
          .not('amount_usdc', 'is', null);

        const total_volume_usdc = (volumeData || []).reduce(
          (sum, order) => sum + (order.amount_usdc || 0),
          0,
        );

        return {
          ...user,
          order_count: orderCount || 0,
          total_volume_usdc,
        };
      }),
    );

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      users: usersWithAggregates,
      total: count || 0,
      page,
      totalPages,
    };
  }

  async getUserDetail(id: string): Promise<AdminUserDetailDto> {
    const supabase = this.supabaseService.getClient();

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      throw new NotFoundException(`User not found`);
    }

    // Fetch bank accounts
    const { data: bankAccounts, error: bankError } = await supabase
      .from('bank_accounts')
      .select('id, user_id, bank_code, account_holder, is_primary, created_at')
      .eq('user_id', id)
      .order('is_primary', { ascending: false });

    if (bankError) {
      throw new BadRequestException(`Failed to fetch bank accounts: ${bankError.message}`);
    }

    // Fetch recent orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_type, amount_vnd, amount_usdc, rate, status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      throw new BadRequestException(`Failed to fetch orders: ${ordersError.message}`);
    }

    // Calculate aggregates
    const { count: orderCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id);

    const { data: volumeData } = await supabase
      .from('orders')
      .select('amount_usdc')
      .eq('user_id', id)
      .not('amount_usdc', 'is', null);

    const total_volume_usdc = (volumeData || []).reduce(
      (sum, order) => sum + (order.amount_usdc || 0),
      0,
    );

    return {
      ...user,
      order_count: orderCount || 0,
      total_volume_usdc,
      bank_accounts: (bankAccounts || []) as BankAccountDto[],
      recent_orders: (orders || []) as OrderDto[],
    };
  }

  async updateKyc(
    id: string,
    dto: UpdateKycDto,
    adminId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('users')
      .update({
        kyc_status: dto.kyc_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Failed to update KYC status: ${error.message}`);
    }

    // TODO: Log audit trail with reason
  }

  async lockUser(
    id: string,
    dto: LockUserDto,
    adminId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('users')
      .update({
        is_locked: true,
        locked_at: new Date().toISOString(),
        locked_by: adminId,
        lock_reason: dto.reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Failed to lock user: ${error.message}`);
    }
  }

  async unlockUser(id: string, adminId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('users')
      .update({
        is_locked: false,
        locked_at: null,
        locked_by: null,
        lock_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Failed to unlock user: ${error.message}`);
    }
  }
}
