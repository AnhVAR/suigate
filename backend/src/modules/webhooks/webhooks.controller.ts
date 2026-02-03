import { Controller, Post, Body, Headers, HttpCode, Param } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import {
  SepayWebhookDto,
  SepayWebhookResponse,
} from './dto/sepay-payment-webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('sepay')
  @HttpCode(200)
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
