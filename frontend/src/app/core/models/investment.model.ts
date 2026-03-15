export type AssetClass = 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'other';

export interface Asset {
  symbol: string;
  name: string;
  asset_class: AssetClass;
  exchange?: string | null;
  source?: string | null;
  updated_at?: string;
}

export interface Investment {
  id: string;
  asset_symbol: string;
  asset_class?: AssetClass;
  type: 'buy' | 'sell' | 'dividend';
  quantity: number | null;
  price: number | null;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface PortfolioSummary {
  asset_symbol: string;
  quantity_held: string;
  total_invested: string;
  total_sold: string;
  total_dividends: string;
  avg_buy_price: string | null;
}

export interface PortfolioValue extends PortfolioSummary {
  asset_name?: string | null;
  current_price: number | null;
  current_value: number | null;
  pnl: number | null;
  pnl_percent: number | null;
  daily_change: number | null;
  daily_change_percent: number | null;
  quote_error?: string;
}

export interface CreateInvestmentDto {
  asset_symbol: string;
  asset_class?: AssetClass;
  type: 'buy' | 'sell' | 'dividend';
  quantity?: number;
  price?: number;
  amount: number;
  date: string;
  notes?: string;
}
