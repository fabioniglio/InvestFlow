import { Controller, Get, Param } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly service: MarketService) {}

  @Get('rates')
  getExchangeRates() {
    return this.service.getExchangeRates();
  }

  @Get('quote/:symbol')
  getQuote(@Param('symbol') symbol: string) {
    return this.service.getQuote(symbol.toUpperCase());
  }
}
