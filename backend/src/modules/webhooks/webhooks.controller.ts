import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('sepay')
  async handleSepayWebhook(@Body() body: any) {
    // TODO: Implement Sepay webhook handler
    return this.webhooksService.handleSepayWebhook(body);
  }
}
