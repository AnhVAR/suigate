import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VietQrService } from './vietqr-generator.service';
import { SmartSellExecutorService } from './smart-sell-executor.service';
import { OrderExpiryHandlerService } from './order-expiry-handler.service';
import { QuickSellDepositCheckerService } from './quick-sell-deposit-checker.service';
import { RatesModule } from '../rates/rates.module';

@Module({
  imports: [RatesModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    VietQrService,
    SmartSellExecutorService,
    OrderExpiryHandlerService,
    QuickSellDepositCheckerService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
