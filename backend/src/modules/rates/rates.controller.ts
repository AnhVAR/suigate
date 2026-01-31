import { Controller, Get, UseGuards } from '@nestjs/common';
import { RatesService } from './rates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RatesResponseDto } from './dto/exchange-rates.dto';

@Controller('rates')
export class RatesController {
  constructor(private ratesService: RatesService) {}

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentRates(): Promise<RatesResponseDto> {
    return this.ratesService.getCurrentRates();
  }
}
