import { Controller, Post, Body, Headers, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { WebhooksService } from './webhooks.service';
import {
  SepayWebhookDto,
  SepayWebhookResponse,
} from './dto/sepay-payment-webhook.dto';

@Controller('webhooks')
@UseGuards(ThrottlerGuard)
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('sepay')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async handleSepay(
    @Body() payload: SepayWebhookDto,
    @Headers('x-sepay-signature') signature: string,
  ): Promise<SepayWebhookResponse> {
    return this.webhooksService.handleSepayWebhook(payload, signature || '');
  }

  /**
   * Simulate SePay payment for sandbox testing
   * Only available in development mode
   */
  @Post('sepay/simulate/:reference')
  @HttpCode(200)
  async simulatePayment(
    @Param('reference') reference: string,
  ): Promise<SepayWebhookResponse> {
    return this.webhooksService.simulatePayment(reference);
  }
}
