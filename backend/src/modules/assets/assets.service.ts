import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Asset,
  AssetClass,
  AssetSearchFilters,
  AssetsRepository,
} from './assets.repository';

@Injectable()
export class AssetsService implements OnModuleInit {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly repo: AssetsRepository,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.seedPopular();
    } catch (e) {
      this.logger.warn('Assets seed skipped or failed', (e as Error).message);
    }
  }

  search(filters: AssetSearchFilters): Promise<Asset[]> {
    return this.repo.search(filters);
  }

  /** Sync US stocks and common ETFs from Finnhub into assets table. */
  async syncFromFinnhub(): Promise<{ added: number }> {
    const token = this.config.get<string>('FINNHUB_API_KEY');
    if (!token) {
      throw new Error('FINNHUB_API_KEY required for sync');
    }

    const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Finnhub sync failed: ${res.status} ${res.statusText}`);
    }

    const list = (await res.json()) as Array<{
      symbol: string;
      description?: string;
      type?: string;
    }>;
    let added = 0;
    for (const item of list) {
      const symbol = item.symbol?.trim();
      if (!symbol || symbol.length > 24) continue;
      const assetClass: AssetClass =
        item.type === 'ETF' ? 'etf' : 'stock';
      const name = (item.description ?? '').trim().slice(0, 255);
      await this.repo.upsert({
        symbol,
        name: name || symbol,
        asset_class: assetClass,
        exchange: 'US',
        source: 'finnhub',
      });
      added++;
    }
    this.logger.log(`Synced ${added} US symbols from Finnhub`);
    return { added };
  }

  /** Seed a small set of popular symbols if the table is empty. */
  async seedPopular(): Promise<{ added: number }> {
    const existing = await this.repo.search({ limit: 1 });
    if (existing.length > 0) return { added: 0 };

    const popular: Array<{ symbol: string; name: string; asset_class: AssetClass }> = [
      { symbol: 'AAPL', name: 'Apple Inc.', asset_class: 'stock' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', asset_class: 'stock' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', asset_class: 'stock' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', asset_class: 'stock' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', asset_class: 'stock' },
      { symbol: 'META', name: 'Meta Platforms Inc.', asset_class: 'stock' },
      { symbol: 'TSLA', name: 'Tesla Inc.', asset_class: 'stock' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', asset_class: 'etf' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', asset_class: 'etf' },
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', asset_class: 'etf' },
      { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin/USDT', asset_class: 'crypto' },
      { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum/USDT', asset_class: 'crypto' },
    ];

    for (const item of popular) {
      await this.repo.upsert({
        ...item,
        exchange: null,
        source: 'seed',
      });
    }
    this.logger.log(`Seeded ${popular.length} popular symbols`);
    return { added: popular.length };
  }
}
