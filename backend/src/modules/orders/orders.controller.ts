import { Controller, Post, Get, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('buy')
  async createBuyOrder(@Body() body: any) {
    // TODO: Implement buy order creation
    return this.ordersService.createBuyOrder(body);
  }

  @Post('quick-sell')
  async createQuickSellOrder(@Body() body: any) {
    // TODO: Implement quick sell order
    return this.ordersService.createQuickSellOrder(body);
  }

  @Post('smart-sell')
  async createSmartSellOrder(@Body() body: any) {
    // TODO: Implement smart sell order
    return this.ordersService.createSmartSellOrder(body);
  }

  @Get()
  async getOrders() {
    // TODO: Implement get user orders
    return this.ordersService.getOrders();
  }
}
