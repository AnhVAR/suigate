import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './common/supabase/supabase.module';
import { SuiModule } from './common/sui/sui.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RatesModule } from './modules/rates/rates.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds window
        limit: 10, // 10 requests per window
      },
    ]),
    SupabaseModule,
    SuiModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    WalletModule,
    RatesModule,
    WebhooksModule,
    BankAccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
