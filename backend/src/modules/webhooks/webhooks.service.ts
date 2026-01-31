import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  async handleSepayWebhook(data: any) {
    // TODO: Implement Sepay webhook processing
    return { message: 'Sepay webhook - to be implemented' };
  }
}
