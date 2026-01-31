import { Injectable } from '@nestjs/common';

@Injectable()
export class RatesService {
  async getCurrentRates() {
    // TODO: Implement fetching current exchange rates
    return { message: 'Get current rates - to be implemented' };
  }
}
