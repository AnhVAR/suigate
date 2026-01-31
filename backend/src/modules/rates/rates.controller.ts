import { Controller, Get } from '@nestjs/common';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('current')
  async getCurrentRates() {
    // TODO: Implement current exchange rates retrieval
    return this.ratesService.getCurrentRates();
  }
}
