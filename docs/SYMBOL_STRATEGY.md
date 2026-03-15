# Strategy: Stocks, ETFs & Crypto in Your DB

## Goal

Have a **reference list of tradeable symbols** (stocks, ETFs, crypto) in your database so you can:

- Offer **search/autocomplete** when adding an investment
- Show **name and type** without calling the quote API first
- Optionally **sync** from an API so the list stays relevant

Your **investments** table stays as-is (user holdings); the new **assets** table is a **catalog** of symbols users can choose from.

---

## 1. Reference table: `assets`

Store one row per symbol you want to support:

| Column        | Type         | Description                    |
|---------------|--------------|--------------------------------|
| `symbol`      | VARCHAR(24)  | Primary key (e.g. AAPL, BINANCE:BTCUSDT) |
| `name`        | VARCHAR(255) | Display name (e.g. "Apple Inc.") |
| `asset_class` | VARCHAR(20)  | stock, etf, crypto, mutual_fund, other |
| `exchange`    | VARCHAR(20)  | Optional (e.g. US, BINANCE)     |
| `source`      | VARCHAR(20)  | Optional: finnhub, manual       |
| `updated_at`  | TIMESTAMP    | Last time we refreshed name    |

Migration `005_create_assets.sql` creates this table.

---

## 2. How to populate `assets`

### Option A: Sync from Finnhub (recommended)

- **Stocks / ETFs (US):**  
  `GET https://finnhub.io/api/v1/stock/symbol?exchange=US&token=YOUR_KEY`  
  Returns many symbols; filter by type if needed (e.g. “Common Stock”, “ETF”) and insert into `assets` with `asset_class = stock` or `etf`.

- **Crypto:**  
  Use Finnhub’s crypto symbols endpoint or a fixed list of pairs (e.g. BINANCE:BTCUSDT, BINANCE:ETHUSDT) and insert with `asset_class = crypto`.

- Run the sync **on a schedule** (e.g. cron) or via an **admin endpoint** (e.g. `POST /admin/sync-symbols`) so your DB stays up to date.

### Option B: Curated list (manual / CSV)

- Maintain a CSV or JSON of “supported symbols” (e.g. top 500 US stocks + major ETFs + top 20 crypto pairs).
- Import once (or periodically) into `assets` with a small script or seed command.

### Option C: On-demand (lazy)

- When a **user adds an investment** with a symbol you don’t have in `assets`, call your existing **profile/quote** logic to get the name (and type if possible), then **INSERT** into `assets`.
- Next time, search/autocomplete can use this row.

You can combine **A + C**: sync a base list from Finnhub, and add new symbols on first use.

---

## 3. Backend: endpoints (implemented)

- **GET /assets?q=aapl&asset_class=stock&limit=50**  
  - Requires JWT. Returns `{ symbol, name, asset_class, ... }` for autocomplete.
- **POST /assets/seed**  
  - Inserts a small list of popular symbols (e.g. AAPL, SPY, BINANCE:BTCUSDT) only if the table is empty. Called automatically on app startup.
- **POST /assets/sync**  
  - Fetches US stocks/ETFs from Finnhub and upserts into `assets`. Requires `FINNHUB_API_KEY`. Run occasionally (e.g. weekly) to refresh the catalog.

---

## 4. Frontend: use the catalog

- In **Add/Edit Investment**, replace (or complement) the free-text symbol field with an **autocomplete** that calls **GET /assets?q=...**.
- User can still type a symbol not in the list; you can either allow it (and optionally add it to `assets` on save, Option C) or show a warning.

---

## 5. What to put in the DB (summary)

| Asset class   | What to store in `assets`                          | Source idea                    |
|---------------|-----------------------------------------------------|--------------------------------|
| **Stocks**    | US (and optionally other exchanges) symbols + name | Finnhub `/stock/symbol?exchange=US` |
| **ETFs**      | Same as stocks; filter by type “ETF” if API allows | Same endpoint or curated list  |
| **Crypto**   | Pairs like BINANCE:BTCUSDT, BINANCE:ETHUSDT         | Finnhub crypto list or fixed set |
| **Other**     | Add later (e.g. mutual funds)                       | Manual or specific API          |

Start with **US stocks + a few dozen ETFs + top crypto pairs**; then expand (more exchanges, more ETFs, on-demand insert) as needed.
