import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminOrdersController } from './orders/admin-orders.controller';
import { AdminOrdersService } from './orders/admin-orders.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminAnalyticsController } from './analytics/admin-analytics.controller';
import { AdminAnalyticsService } from './analytics/admin-analytics.service';
import { AdminSettlementsController } from './settlements/admin-settlements.controller';
import { AdminSettlementsService } from './settlements/admin-settlements.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [
    AdminController,
    AdminOrdersController,
    AdminUsersController,
    AdminAnalyticsController,
    AdminSettlementsController,
  ],
  providers: [
    AdminService,
    AdminOrdersService,
    AdminUsersService,
    AdminAnalyticsService,
    AdminSettlementsService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
