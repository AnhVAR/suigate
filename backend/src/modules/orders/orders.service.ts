import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SuiClientService } from '../../common/sui/sui-client.service';
import { RatesService } from '../rates/rates.service';
import { VietQrService } from './vietqr-generator.service';
import {
  CreateBuyOrderDto,
  BuyOrderResponseDto,
  CreateQuickSellOrderDto,
  QuickSellOrderResponseDto,
  CreateSmartSellOrderDto,
  SmartSellOrderResponseDto,
  ConfirmOrderDto,
  OrderDto,
  OrderListResponseDto,
} from './dto/order-types.dto';
import {
  CancelPayloadDto,
  CancelOrderDto,
  CancelOrderResponseDto,
} from './dto/order-matching.dto';
import { OrderMatchingEngineService } from './order-matching-engine.service';

const ORDER_EXPIRY_MINUTES = 15;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private supabase: SupabaseService,
    private suiClient: SuiClientService,
    private ratesService: RatesService,
    private vietQrService: VietQrService,
    private matchingEngine: OrderMatchingEngineService,
  ) {}

  async createBuyOrder(
    userId: string,
    dto: CreateBuyOrderDto,
  ): Promise<BuyOrderResponseDto> {
    // Server-side amount validation
    const MIN_AMOUNT_VND = 50000; // 50k VND minimum
    const MAX_AMOUNT_VND = 100000000; // 100M VND maximum (reasonable limit)

    if (dto.amountVnd < MIN_AMOUNT_VND) {
      throw new BadRequestException(
        `Minimum order amount is ${MIN_AMOUNT_VND.toLocaleString('vi-VN')} VND`,
      );
    }

    if (dto.amountVnd > MAX_AMOUNT_VND) {
      throw new BadRequestException(
        `Maximum order amount is ${MAX_AMOUNT_VND.toLocaleString('vi-VN')} VND`,
      );
    }

    const rates = await this.ratesService.getCurrentRates();
    const amountUsdc = dto.amountVnd / rates.buyRate;
    const reference = this.vietQrService.generateReference();
    const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60 * 1000);

    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .insert({
        user_id: userId,
        order_type: 'buy',
        amount_vnd: dto.amountVnd,
        amount_usdc: amountUsdc,
        rate: rates.buyRate,
        status: 'pending',
        sepay_reference: reference,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create buy order', error);
      throw new Error('Failed to create order');
    }

    const qrCode = this.vietQrService.generateQrContent(
      dto.amountVnd,
      reference,
    );

    return {
      orderId: data.id,
      amountVnd: dto.amountVnd,
      amountUsdc: amountUsdc.toFixed(6),
      rate: rates.buyRate,
      qrCode,
      reference,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async createQuickSellOrder(
    userId: string,
    dto: CreateQuickSellOrderDto,
  ): Promise<QuickSellOrderResponseDto> {
    // Verify bank account belongs to user
    await this.verifyBankAccount(userId, dto.bankAccountId);

    const rates = await this.ratesService.getCurrentRates();
    const amountUsdc = parseFloat(dto.amountUsdc);
    const amountVnd = amountUsdc * rates.sellRate;

    // USDC has 6 decimals, convert to smallest unit (mist)
    const amountMist = Math.round(amountUsdc * 1_000_000);

    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .insert({
        user_id: userId,
        bank_account_id: dto.bankAccountId,
        order_type: 'quick_sell',
        amount_vnd: amountVnd,
        amount_usdc: amountUsdc,
        rate: rates.sellRate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create quick sell order', error);
      throw new Error('Failed to create order');
    }

    return {
      orderId: data.id,
      amountUsdc: dto.amountUsdc,
      amountVnd: Math.round(amountVnd),
      rate: rates.sellRate,
      bankAccountId: dto.bankAccountId,
      status: 'pending',
      depositPayload: {
        orderId: data.id,
        poolObjectId: this.suiClient.getPoolId(),
        packageId: this.suiClient.getPackageId(),
        usdcType: this.suiClient.getUsdcType(),
        amountMist: amountMist.toString(),
      },
    };
  }

  async createSmartSellOrder(
    userId: string,
    dto: CreateSmartSellOrderDto,
  ): Promise<SmartSellOrderResponseDto> {
    await this.verifyBankAccount(userId, dto.bankAccountId);

    const rates = await this.ratesService.getCurrentRates();
    const amountUsdc = parseFloat(dto.amountUsdc);

    // Validate target rate (must be within 10% of current)
    const maxRate = rates.sellRate * 1.1;
    if (dto.targetRate > maxRate) {
      throw new BadRequestException(
        'Target rate too high (max 10% above current)',
      );
    }

    const quickSellVnd = amountUsdc * rates.sellRate;
    const smartSellVnd = amountUsdc * dto.targetRate;
    const fee = amountUsdc * 0.002; // 0.2% fee

    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .insert({
        user_id: userId,
        bank_account_id: dto.bankAccountId,
        order_type: 'smart_sell',
        amount_usdc: amountUsdc,
        rate: rates.sellRate,
        target_rate: dto.targetRate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create smart sell order', error);
      throw new Error('Failed to create order');
    }

    // Prepare escrow payload for frontend
    const amountMist = Math.floor(amountUsdc * 1_000_000).toString();

    return {
      orderId: data.id,
      amountUsdc: dto.amountUsdc,
      targetRate: dto.targetRate,
      currentRate: rates.sellRate,
      fee: fee.toFixed(6),
      comparison: {
        quickSellVnd: Math.round(quickSellVnd),
        smartSellVnd: Math.round(smartSellVnd - fee * dto.targetRate),
        savings: Math.round(smartSellVnd - quickSellVnd),
      },
      escrowPayload: {
        orderId: data.id,
        amountMist,
        targetRate: dto.targetRate,
        bankAccountId: dto.bankAccountId,
      },
    };
  }

  async confirmOrder(
    userId: string,
    orderId: string,
    dto: ConfirmOrderDto,
  ): Promise<OrderDto> {
    const order = await this.getOrderById(userId, orderId);

    if (order.status !== 'pending') {
      throw new BadRequestException('Order is not pending');
    }

    // Verify transaction on Sui
    const isConfirmed = await this.suiClient.verifyTransaction(dto.txHash);
    if (!isConfirmed) {
      throw new BadRequestException('Transaction not confirmed on blockchain');
    }

    // Store transaction
    await this.supabase.getClient().from('transactions').insert({
      order_id: orderId,
      tx_hash: dto.txHash,
      tx_status: 'confirmed',
    });

    // Build update payload - for smart_sell, initialize fill tracking
    const updatePayload: any = {
      status: 'processing',
      updated_at: new Date().toISOString(),
    };

    // Smart sell orders: initialize remaining_usdc for matching
    if (order.orderType === 'smart_sell' && order.amountUsdc) {
      updatePayload.remaining_usdc = parseFloat(order.amountUsdc);
      updatePayload.filled_usdc = 0;
    }

    // Update order status
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error('Failed to update order');

    return this.mapOrderToDto(data);
  }

  /**
   * Get cancel payload for smart sell order.
   * Returns info needed to build cancel transaction (or null txPayload if fully filled).
   */
  async getCancelPayload(
    userId: string,
    orderId: string,
  ): Promise<CancelPayloadDto> {
    const order = await this.getOrderById(userId, orderId);

    if (order.orderType !== 'smart_sell') {
      throw new BadRequestException('Only smart sell orders can be cancelled');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    const remainingUsdc = await this.matchingEngine.getOrderRemaining(orderId);
    const filledUsdc = order.amountUsdc
      ? parseFloat(order.amountUsdc) - remainingUsdc
      : 0;
    const pendingVnd = await this.matchingEngine.getPendingVnd(orderId);

    return {
      orderId,
      escrowObjectId: order.escrowObjectId || undefined,
      remainingUsdc,
      filledUsdc,
      pendingVnd,
      packageId: remainingUsdc > 0 ? this.suiClient.getPackageId() : undefined,
      // txPayload is null if fully filled (DB-only cancel)
      txPayload: remainingUsdc > 0 && order.escrowObjectId ? 'SIGN_REQUIRED' : undefined,
    };
  }

  /**
   * Cancel smart sell order.
   * If order has remaining USDC, requires txHash from on-chain cancel.
   */
  async cancelOrder(
    userId: string,
    orderId: string,
    dto?: CancelOrderDto,
  ): Promise<CancelOrderResponseDto> {
    const order = await this.getOrderById(userId, orderId);

    if (order.orderType !== 'smart_sell') {
      throw new BadRequestException('Only smart sell orders can be cancelled');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    const remainingUsdc = await this.matchingEngine.getOrderRemaining(orderId);
    const filledUsdc = order.amountUsdc
      ? parseFloat(order.amountUsdc) - remainingUsdc
      : 0;

    // If has remaining USDC and escrow exists, verify on-chain cancel tx
    if (remainingUsdc > 0 && order.escrowObjectId) {
      if (!dto?.txHash) {
        throw new BadRequestException(
          'Transaction hash required for cancel with remaining balance',
        );
      }

      const isConfirmed = await this.suiClient.verifyTransaction(dto.txHash);
      if (!isConfirmed) {
        throw new BadRequestException('Cancel transaction not confirmed');
      }

      // Record cancel transaction
      await this.supabase.getClient().from('transactions').insert({
        order_id: orderId,
        tx_hash: dto.txHash,
        tx_status: 'confirmed',
      });
    }

    // Update order status to cancelled
    const { error } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw new Error('Failed to cancel order');

    const pendingVnd = await this.matchingEngine.getPendingVnd(orderId);

    return {
      orderId,
      status: 'cancelled',
      filledUsdc,
      refundedUsdc: remainingUsdc,
      pendingVnd,
    };
  }

  /** Store escrow object ID after mobile app creates on-chain escrow */
  async updateEscrowObjectId(
    userId: string,
    orderId: string,
    escrowObjectId: string,
  ): Promise<OrderDto> {
    const order = await this.getOrderById(userId, orderId);

    if (order.orderType !== 'smart_sell') {
      throw new BadRequestException('Only smart sell orders have escrow');
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .update({
        escrow_object_id: escrowObjectId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error('Failed to update escrow object ID');

    return this.mapOrderToDto(data);
  }

  async listOrders(userId: string): Promise<OrderListResponseDto> {
    const { data, error, count } = await this.supabase
      .getClient()
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error('Failed to fetch orders');

    return {
      orders: (data || []).map((row) => this.mapOrderToDto(row)),
      total: count || 0,
    };
  }

  async getOrder(userId: string, orderId: string): Promise<OrderDto> {
    return this.getOrderById(userId, orderId);
  }

  private async getOrderById(
    userId: string,
    orderId: string,
  ): Promise<OrderDto> {
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Order not found');
    }

    return this.mapOrderToDto(data);
  }

  private async verifyBankAccount(
    userId: string,
    bankAccountId: number,
  ): Promise<void> {
    const { data } = await this.supabase
      .getClient()
      .from('bank_accounts')
      .select('id')
      .eq('id', bankAccountId)
      .eq('user_id', userId)
      .single();

    if (!data) {
      throw new BadRequestException('Bank account not found');
    }
  }

  private mapOrderToDto(row: any): OrderDto {
    return {
      id: row.id,
      orderType: row.order_type,
      amountVnd: row.amount_vnd,
      amountUsdc: row.amount_usdc?.toString() || null,
      rate: row.rate,
      targetRate: row.target_rate,
      status: row.status,
      sepayReference: row.sepay_reference,
      escrowObjectId: row.escrow_object_id,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  }
}
