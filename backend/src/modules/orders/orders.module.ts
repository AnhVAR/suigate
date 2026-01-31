import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VietQrService } from './vietqr-generator.service';
import { RatesModule } from '../rates/rates.module';

@Module({
  imports: [RatesModule],
  controllers: [OrdersController],
  providers: [OrdersService, VietQrService],
  exports: [OrdersService],
})
export class OrdersModule {}
