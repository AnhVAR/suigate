import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('buy')
  async createBuyOrder(
    @Request() req,
    @Body() dto: CreateBuyOrderDto,
  ): Promise<BuyOrderResponseDto> {
    return this.ordersService.createBuyOrder(req.user.id, dto);
  }

  @Post('quick-sell')
  async createQuickSellOrder(
    @Request() req,
    @Body() dto: CreateQuickSellOrderDto,
  ): Promise<QuickSellOrderResponseDto> {
    return this.ordersService.createQuickSellOrder(req.user.id, dto);
  }

  @Post('smart-sell')
  async createSmartSellOrder(
    @Request() req,
    @Body() dto: CreateSmartSellOrderDto,
  ): Promise<SmartSellOrderResponseDto> {
    return this.ordersService.createSmartSellOrder(req.user.id, dto);
  }

  @Get()
  async listOrders(@Request() req): Promise<OrderListResponseDto> {
    return this.ordersService.listOrders(req.user.id);
  }

  @Get(':id')
  async getOrder(@Request() req, @Param('id') id: string): Promise<OrderDto> {
    return this.ordersService.getOrder(req.user.id, id);
  }

  @Post(':id/confirm')
  async confirmOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ConfirmOrderDto,
  ): Promise<OrderDto> {
    return this.ordersService.confirmOrder(req.user.id, id, dto);
  }

  @Post(':id/escrow')
  async setEscrowObjectId(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: { escrowObjectId: string },
  ): Promise<OrderDto> {
    return this.ordersService.updateEscrowObjectId(
      req.user.id,
      id,
      dto.escrowObjectId,
    );
  }

  @Get(':id/cancel-payload')
  async getCancelPayload(
    @Request() req,
    @Param('id') id: string,
  ): Promise<CancelPayloadDto> {
    return this.ordersService.getCancelPayload(req.user.id, id);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<CancelOrderResponseDto> {
    return this.ordersService.cancelOrder(req.user.id, id, dto);
  }

  @Delete(':id')
  async deleteOrder(
    @Request() req,
    @Param('id') id: string,
  ): Promise<CancelOrderResponseDto> {
    // Legacy endpoint - redirect to cancelOrder without txHash (only works for pending orders)
    return this.ordersService.cancelOrder(req.user.id, id);
  }
}
