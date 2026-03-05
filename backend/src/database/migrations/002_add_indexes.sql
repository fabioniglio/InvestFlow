CREATE INDEX IF NOT EXISTS idx_investments_asset ON investments (asset_symbol);
CREATE INDEX IF NOT EXISTS idx_investments_date  ON investments (date);
CREATE INDEX IF NOT EXISTS idx_investments_type  ON investments (type);
