import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
const RATES_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const BASE_CURRENCY = 'USD';
const SUPPORTED_CURRENCIES = ['EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
}

/** Finnhub quote response: c=current, d=change, dp=change %, h/l/o=high/low/open, pc=previous close */
interface FinnhubQuote {
  c?: number;
  d?: number;
  dp?: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
}

/** Yahoo Finance quote response (yahoo-finance2 .quote()) */
interface YahooQuoteResult {
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
}

@Injectable()
export class MarketService implements OnModuleInit {
  private readonly logger = new Logger(MarketService.name);
  private readonly cache = new Map<
    string,
    { quote: MarketQuote; expiresAt: number }
  >();
  private ratesCache: { rates: ExchangeRates; expiresAt: number } | null = null;
  private finnhubToken: string | undefined;
  private yf: { quote(symbol: string): Promise<YahooQuoteResult> };

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.finnhubToken = this.config.get<string>('FINNHUB_API_KEY');
    if (this.finnhubToken) {
      this.logger.log('Using Finnhub for quote data (FINNHUB_API_KEY set)');
    } else {
      this.logger.warn(
        'FINNHUB_API_KEY not set; falling back to Yahoo Finance (may hit rate limits)',
      );
    }
    const module = await import('yahoo-finance2');
    const YahooFinance = module.default as new () => {
      quote(symbol: string): Promise<YahooQuoteResult>;
    };
    this.yf = new YahooFinance();
  }

  private async getQuoteFromFinnhub(sym: string): Promise<MarketQuote> {
    const token = this.finnhubToken;
    if (!token) throw new Error('Finnhub API key not configured');
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as FinnhubQuote;
    const price = data.c;
    if (price == null || typeof price !== 'number') {
      throw new Error(`No price data for symbol: ${sym}`);
    }
    const prevClose = data.pc ?? price;
    const change = data.d ?? price - prevClose;
    const changePercent =
      data.dp ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0);
    return {
      price,
      change,
      changePercent,
      high: data.h ?? price,
      low: data.l ?? price,
      open: data.o ?? price,
      previousClose: prevClose,
    };
  }

  private async getQuoteFromYahoo(sym: string): Promise<MarketQuote> {
    const result = await this.yf.quote(sym);
    if (!result?.regularMarketPrice) {
      throw new Error(`No price data for symbol: ${sym}`);
    }
    return {
      price: result.regularMarketPrice,
      change: result.regularMarketChange ?? 0,
      changePercent: result.regularMarketChangePercent ?? 0,
      high: result.regularMarketDayHigh ?? 0,
      low: result.regularMarketDayLow ?? 0,
      open: result.regularMarketOpen ?? 0,
      previousClose: result.regularMarketPreviousClose ?? 0,
    };
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const sym = symbol?.toUpperCase?.() ?? symbol;
    const cached = this.cache.get(sym);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.quote;
    }

    let quote: MarketQuote;
    if (this.finnhubToken) {
      try {
        quote = await this.getQuoteFromFinnhub(sym);
      } catch (err) {
        this.logger.warn(
          `Finnhub failed for ${sym}, trying Yahoo: ${(err as Error).message}`,
        );
        quote = await this.getQuoteFromYahoo(sym);
      }
    } else {
      quote = await this.getQuoteFromYahoo(sym);
    }

    this.cache.set(sym, { quote, expiresAt: Date.now() + CACHE_TTL_MS });
    return quote;
  }

  async getQuoteSafe(
    symbol: string,
  ): Promise<{ quote: MarketQuote | null; error?: string }> {
    const sym = symbol?.toUpperCase?.() ?? symbol;
    try {
      const quote = await this.getQuote(sym);
      return { quote };
    } catch (err) {
      const msg = (err as Error).message;
      const stack = (err as Error).stack;
      this.logger.warn(`Quote failed for ${sym}: ${msg}`);
      if (process.env.NODE_ENV !== 'production' && stack) {
        this.logger.debug(stack);
      }
      return { quote: null, error: msg };
    }
  }

  async getExchangeRates(): Promise<ExchangeRates> {
    if (this.ratesCache && Date.now() < this.ratesCache.expiresAt) {
      return this.ratesCache.rates;
    }
    const to = SUPPORTED_CURRENCIES.join(',');
    const url = `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${to}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Rates API error: ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as {
        base: string;
        rates: Record<string, number>;
      };
      const rates: ExchangeRates = {
        base: data.base ?? BASE_CURRENCY,
        rates: data.rates ?? {},
      };
      this.ratesCache = {
        rates,
        expiresAt: Date.now() + RATES_CACHE_TTL_MS,
      };
      return rates;
    } catch (err) {
      this.logger.warn(
        `Failed to fetch exchange rates: ${(err as Error).message}`,
      );
      if (this.ratesCache) return this.ratesCache.rates;
      return { base: BASE_CURRENCY, rates: {} };
    }
  }
}
