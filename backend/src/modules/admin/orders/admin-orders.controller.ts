import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import {
  AdminOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/admin-orders.dto';

@Controller('admin/orders')
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(private adminOrdersService: AdminOrdersService) {}

  @Get()
  async listOrders(@Query() query: AdminOrdersQueryDto) {
    return this.adminOrdersService.listOrders(query);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.adminOrdersService.getOrder(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any
  ) {
    const adminId = req.user?.userId;
    return this.adminOrdersService.updateOrderStatus(id, dto, adminId);
  }

  @Post(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.userId;
    return this.adminOrdersService.confirmPayment(id, adminId);
  }

  @Post(':id/dispense-usdc')
  async dispenseUsdc(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.userId;
    return this.adminOrdersService.dispenseUsdc(id, adminId);
  }

  @Post(':id/disburse-vnd')
  async disburseVnd(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.userId;
    return this.adminOrdersService.disburseVnd(id, adminId);
  }
}
