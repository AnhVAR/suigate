import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics.dto';

@Controller('admin/analytics')
@UseGuards(AdminAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('summary')
  async getSummary(@Query() query: AnalyticsQueryDto) {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    return this.analyticsService.getSummary(from, to);
  }

  @Get('volume')
  async getVolume(@Query() query: AnalyticsQueryDto) {
    const period = query.period || 'daily';
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    return this.analyticsService.getVolumeData(period, from, to);
  }

  @Get('revenue')
  async getRevenue(@Query() query: AnalyticsQueryDto) {
    const period = query.period || 'daily';
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    return this.analyticsService.getRevenueData(period, from, to);
  }

  @Get('users')
  async getUserGrowth(@Query() query: AnalyticsQueryDto) {
    const period = query.period || 'daily';
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    return this.analyticsService.getUserGrowth(period, from, to);
  }

  @Get('kyc-distribution')
  async getKycDistribution() {
    return this.analyticsService.getKycDistribution();
  }

  @Get('order-breakdown')
  async getOrderBreakdown(@Query() query: AnalyticsQueryDto) {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    return this.analyticsService.getOrderBreakdown(from, to);
  }
}
