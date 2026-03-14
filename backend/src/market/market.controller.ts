import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketController {
  constructor(private readonly service: MarketService) {}

  @Get('rates')
  getExchangeRates() {
    return this.service.getExchangeRates();
  }

  @Get('profile/:symbol')
  async getSymbolProfile(@Param('symbol') symbol: string) {
    const name = await this.service.getSymbolName(symbol);
    return { name };
  }

  @Get('quote/:symbol')
  getQuote(@Param('symbol') symbol: string) {
    return this.service.getQuote(symbol.toUpperCase());
  }
}
