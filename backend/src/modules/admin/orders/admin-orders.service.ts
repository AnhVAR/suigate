import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import {
  AdminOrdersQueryDto,
  AdminOrderDto,
  AdminOrdersResponse,
  UpdateOrderStatusDto,
} from './dto/admin-orders.dto';

@Injectable()
export class AdminOrdersService {
  constructor(private supabase: SupabaseService) {}

  async listOrders(query: AdminOrdersQueryDto): Promise<AdminOrdersResponse> {
    const {
      page = 1,
      limit = 50,
      order_type,
      status,
      needs_manual_review,
      date_from,
      date_to,
      search,
    } = query;

    const offset = (page - 1) * limit;

    // Build query with joins
    let supabaseQuery = this.supabase
      .getClient()
      .from('orders')
      .select(
        `
        *,
        users!inner(sui_address, kyc_status),
        bank_accounts(bank_code),
        transactions(tx_hash, tx_status)
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (order_type) {
      supabaseQuery = supabaseQuery.eq('order_type', order_type);
    }

    if (status) {
      supabaseQuery = supabaseQuery.eq('status', status);
    }

    if (needs_manual_review !== undefined) {
      supabaseQuery = supabaseQuery.eq('needs_manual_review', needs_manual_review);
    }

    if (date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', date_from);
    }

    if (date_to) {
      supabaseQuery = supabaseQuery.lte('created_at', date_to);
    }

    // Search across id, sui_address, sepay_reference
    if (search) {
      supabaseQuery = supabaseQuery.or(
        `id.ilike.%${search}%,users.sui_address.ilike.%${search}%,sepay_reference.ilike.%${search}%`
      );
    }

    // Order by created_at descending (newest first)
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

    // Paginate
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw new BadRequestException(`Failed to fetch orders: ${error.message}`);
    }

    // Transform data to AdminOrderDto format
    const orders: AdminOrderDto[] = (data || []).map((order: any) => {
      // Get latest transaction (if any)
      const latestTx = order.transactions?.[0] || null;
      return {
        id: order.id,
        user_id: order.user_id,
        user_sui_address: order.users?.sui_address || '',
        user_kyc_status: order.users?.kyc_status || 'pending',
        bank_account_id: order.bank_account_id,
        bank_code: order.bank_accounts?.bank_code || null,
        order_type: order.order_type,
        amount_vnd: order.amount_vnd,
        amount_usdc: order.amount_usdc,
        rate: order.rate,
        target_rate: order.target_rate,
        status: order.status,
        escrow_object_id: order.escrow_object_id,
        sepay_reference: order.sepay_reference,
        needs_manual_review: order.needs_manual_review,
        expires_at: order.expires_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
        tx_hash: latestTx?.tx_hash || null,
        tx_status: latestTx?.tx_status || null,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      total,
      page,
      totalPages,
    };
  }

  async getOrder(id: string): Promise<AdminOrderDto> {
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select(
        `
        *,
        users!inner(sui_address, kyc_status),
        bank_accounts(bank_code),
        transactions(tx_hash, tx_status)
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const latestTx = data.transactions?.[0] || null;

    return {
      id: data.id,
      user_id: data.user_id,
      user_sui_address: data.users?.sui_address || '',
      user_kyc_status: data.users?.kyc_status || 'pending',
      bank_account_id: data.bank_account_id,
      bank_code: data.bank_accounts?.bank_code || null,
      order_type: data.order_type,
      amount_vnd: data.amount_vnd,
      amount_usdc: data.amount_usdc,
      rate: data.rate,
      target_rate: data.target_rate,
      status: data.status,
      escrow_object_id: data.escrow_object_id,
      sepay_reference: data.sepay_reference,
      needs_manual_review: data.needs_manual_review,
      expires_at: data.expires_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tx_hash: latestTx?.tx_hash || null,
      tx_status: latestTx?.tx_status || null,
    };
  }

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    adminId: string
  ): Promise<AdminOrderDto> {
    // First, verify order exists
    const order = await this.getOrder(id);

    // Update status
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        status: dto.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update order status: ${error.message}`);
    }

    // TODO: Log audit trail (admin_id, timestamp, old_status, new_status, reason)
    // This would require an audit_logs table

    return this.getOrder(id);
  }

  async confirmPayment(id: string, adminId: string): Promise<AdminOrderDto> {
    const order = await this.getOrder(id);

    // Only for buy orders in pending status
    if (order.order_type !== 'buy') {
      throw new BadRequestException('Can only confirm payment for buy orders');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('Order must be in pending status');
    }

    // Update to paid status
    const { error } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Failed to confirm payment: ${error.message}`);
    }

    return this.getOrder(id);
  }

  async dispenseUsdc(id: string, adminId: string): Promise<AdminOrderDto> {
    const order = await this.getOrder(id);

    if (order.order_type !== 'buy') {
      throw new BadRequestException('Can only dispense USDC for buy orders');
    }

    if (order.status !== 'paid') {
      throw new BadRequestException('Order must be in paid status');
    }

    // TODO: Trigger USDC dispense job
    // This would integrate with Sui blockchain service

    // Update to processing status
    const { error } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Failed to dispense USDC: ${error.message}`);
    }

    return this.getOrder(id);
  }

  async disburseVnd(id: string, adminId: string): Promise<AdminOrderDto> {
    const order = await this.getOrder(id);

    if (!['quick_sell', 'smart_sell'].includes(order.order_type)) {
      throw new BadRequestException('Can only disburse VND for sell orders');
    }

    if (order.status !== 'processing') {
      throw new BadRequestException('Order must be in processing status');
    }

    // TODO: Trigger VND disbursement via bank transfer
    // This would integrate with payment service (Sepay)

    // Update to settled status
    const { error } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        status: 'settled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Failed to disburse VND: ${error.message}`);
    }

    return this.getOrder(id);
  }
}
