import { Controller, Get } from '@nestjs/common';
import { RatesService } from './rates.service';
import { RatesResponseDto } from './dto/exchange-rates.dto';

@Controller('rates')
export class RatesController {
  constructor(private ratesService: RatesService) {}

  @Get('current')
  async getCurrentRates(): Promise<RatesResponseDto> {
    return this.ratesService.getCurrentRates();
  }
}
