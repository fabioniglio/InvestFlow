import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export interface MarketQuote {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class MarketService implements OnModuleInit {
  private readonly logger = new Logger(MarketService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private yf: any;
  private readonly cache = new Map<string, { quote: MarketQuote; expiresAt: number }>();

  async onModuleInit(): Promise<void> {
    const module = await import('yahoo-finance2');
    const YahooFinance = module.default;
    this.yf = new YahooFinance();
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.quote;
    }

    const result = await this.yf.quote(symbol);

    if (!result.regularMarketPrice) {
      throw new Error(`No price data for symbol: ${symbol}`);
    }

    const quote: MarketQuote = {
      price: result.regularMarketPrice,
      change: result.regularMarketChange ?? 0,
      changePercent: result.regularMarketChangePercent ?? 0,
      high: result.regularMarketDayHigh ?? 0,
      low: result.regularMarketDayLow ?? 0,
      open: result.regularMarketOpen ?? 0,
      previousClose: result.regularMarketPreviousClose ?? 0,
    };

    this.cache.set(symbol, { quote, expiresAt: Date.now() + CACHE_TTL_MS });
    return quote;
  }

  async getQuoteSafe(symbol: string): Promise<MarketQuote | null> {
    try {
      return await this.getQuote(symbol);
    } catch (err) {
      this.logger.warn(`Could not fetch quote for ${symbol}: ${(err as Error).message}`);
      return null;
    }
  }
}
