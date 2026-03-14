# How InvestFlow Gets Market Data (Stocks, ETFs, Crypto, etc.)

InvestFlow stores **your portfolio and transactions** in the database and uses **external APIs only for current prices**. This keeps your data under your control and avoids API limits for historical data.

---

## What We Store vs What We Fetch

| Data | Where it lives | How we get it |
|------|----------------|---------------|
| Your holdings (symbol, quantity, buy/sell/dividend, dates, amounts) | **Database** | You enter it (or import). |
| Current price per symbol | **API** | Fetched when you open Portfolio or refresh; cached for 5 minutes. |
| Stock/company name (e.g. "Apple Inc.") | **API** | Finnhub Company Profile 2; cached 24 hours. |
| Exchange rates (USD → EUR, GBP, …) | **API** | Frankfurter; cached 1 hour. |
| Dividend income | **Database** | Sum of all `dividend` transactions; shown as "Dividend income" in the portfolio. |

---

## Asset Types and Symbol Formats

Current price is fetched from **Finnhub** (with Yahoo Finance as fallback for stocks/ETFs). The same backend quote endpoint is used for all types; the **symbol format** depends on the asset class.

| Asset class | Symbol format | Example | Notes |
|-------------|----------------|---------|--------|
| **Stock** | Ticker | `AAPL`, `MSFT`, `GOOGL` | US and many international equities. |
| **ETF** | Ticker | `SPY`, `QQQ`, `VOO`, `VTI` | Same as stocks; use the fund’s ticker. |
| **Crypto** | `EXCHANGE:PAIR` | `BINANCE:BTCUSDT`, `BINANCE:ETHUSDT` | Finnhub uses exchange:pair; don’t uppercase the whole symbol. |
| **Mutual fund** | Ticker (if supported) | `VFIAX`, `VTSAX` | Some funds work on Yahoo/Finnhub; others may return no quote (you can still track them, current value may show as —). |
| **Other** | Any | — | For things we don’t fetch (e.g. bonds, private assets), track in DB only; current value can be manual or —. |

When adding an investment, choose the **Asset class** in the form. Use the symbol formats above so the API can resolve the price.

---

## APIs and Limits

| API | Used for | Limit / notes |
|-----|----------|----------------|
| **Finnhub** | Stock, ETF, and crypto quotes (primary); company name via Company Profile 2 | Free tier: 60 calls/min. Quotes cached 5 min, profile (name) cached 24h. |
| **Yahoo Finance** (yahoo-finance2) | Stock/ETF quotes (fallback only) | Often 429 when used from servers (e.g. Docker). Prefer Finnhub in production. |
| **Frankfurter** | USD → EUR, GBP, CHF, JPY, CAD, AUD | Free, no key; we cache 1 hour. |

If you have many symbols, opening the portfolio page can trigger one quote request per symbol. With caching and a 60/min Finnhub limit, avoid refreshing too often with 60+ symbols.

---

## Adding or Changing Data Sources

- **Backend:** `backend/src/market/market.service.ts` — `getQuoteFromFinnhub`, `getQuoteFromYahoo`, and `getQuote()` (routing and cache).
- **Asset class:** Stored in `investments.asset_class`; used for display and for correct symbol handling (e.g. crypto not uppercased). New asset types (e.g. “bond”) can be added in the migration and DTOs and then routed to a dedicated provider if you add one later.
