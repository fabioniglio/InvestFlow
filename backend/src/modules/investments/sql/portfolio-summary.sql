SELECT
  asset_symbol,
  SUM(CASE WHEN type = 'buy'      THEN COALESCE(quantity, 0) ELSE 0 END) -
  SUM(CASE WHEN type = 'sell'     THEN COALESCE(quantity, 0) ELSE 0 END) AS quantity_held,
  SUM(CASE WHEN type = 'buy'      THEN amount ELSE 0 END)                AS total_invested,
  SUM(CASE WHEN type = 'sell'     THEN amount ELSE 0 END)                AS total_sold,
  SUM(CASE WHEN type = 'dividend' THEN amount ELSE 0 END)                AS total_dividends,
  CASE
    WHEN SUM(CASE WHEN type = 'buy' THEN COALESCE(quantity, 0) ELSE 0 END) > 0
    THEN SUM(CASE WHEN type = 'buy' THEN amount ELSE 0 END) /
         SUM(CASE WHEN type = 'buy' THEN COALESCE(quantity, 0) ELSE 0 END)
    ELSE NULL
  END AS avg_buy_price
FROM investments
WHERE user_id = $1
GROUP BY asset_symbol
ORDER BY asset_symbol;
