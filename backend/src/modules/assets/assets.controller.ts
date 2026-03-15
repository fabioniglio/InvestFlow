import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  search(
    @Query('q') q?: string,
    @Query('asset_class') assetClass?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.search({
      q: q?.trim() || undefined,
      asset_class: assetClass as
        | 'stock'
        | 'etf'
        | 'crypto'
        | 'mutual_fund'
        | 'other'
        | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /** One-time or cron: seed popular symbols if assets table is empty. */
  @Post('seed')
  seedPopular() {
    return this.service.seedPopular();
  }

  /** Sync US stocks/ETFs from Finnhub (rate-limited; run occasionally). */
  @Post('sync')
  syncFromFinnhub() {
    return this.service.syncFromFinnhub();
  }
}
