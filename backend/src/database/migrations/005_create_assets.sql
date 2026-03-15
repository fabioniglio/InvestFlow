-- Reference table of tradeable symbols (stocks, ETFs, crypto) for search/autocomplete
CREATE TABLE IF NOT EXISTS assets (
  symbol      VARCHAR(24) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL DEFAULT '',
  asset_class VARCHAR(20)  NOT NULL DEFAULT 'stock'
    CHECK (asset_class IN ('stock', 'etf', 'crypto', 'mutual_fund', 'other')),
  exchange    VARCHAR(20),
  source      VARCHAR(20),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_asset_class ON assets (asset_class);
CREATE INDEX IF NOT EXISTS idx_assets_name ON assets (name);
