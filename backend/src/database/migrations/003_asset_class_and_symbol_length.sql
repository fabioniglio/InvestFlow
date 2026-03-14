-- Support longer symbols (e.g. BINANCE:BTCUSDT for crypto) and optional asset class
ALTER TABLE investments
  ALTER COLUMN asset_symbol TYPE VARCHAR(24);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'asset_class'
  ) THEN
    ALTER TABLE investments
      ADD COLUMN asset_class VARCHAR(20) NOT NULL DEFAULT 'stock'
      CHECK (asset_class IN ('stock', 'etf', 'crypto', 'mutual_fund', 'other'));
  END IF;
END $$;
