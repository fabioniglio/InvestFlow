import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type AssetClass = 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'other';

export interface Asset {
  symbol: string;
  name: string;
  asset_class: AssetClass;
  exchange: string | null;
  source: string | null;
  updated_at: Date;
}

export interface AssetSearchFilters {
  q?: string;
  asset_class?: AssetClass;
  limit?: number;
}

@Injectable()
export class AssetsRepository {
  constructor(private readonly db: DatabaseService) {}

  async search(filters: AssetSearchFilters): Promise<Asset[]> {
    const limit = Math.min(filters.limit ?? 50, 100);
    const params: unknown[] = [];
    const conditions: string[] = [];
    let pos = 0;

    if (filters.q?.trim()) {
      const term = `%${filters.q.trim()}%`;
      pos++;
      params.push(term);
      const symPos = pos;
      pos++;
      params.push(term);
      const namePos = pos;
      conditions.push(`(symbol ILIKE $${symPos} OR name ILIKE $${namePos})`);
    }

    if (filters.asset_class) {
      pos++;
      params.push(filters.asset_class);
      conditions.push(`asset_class = $${pos}`);
    }

    pos++;
    params.push(limit);
    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT symbol, name, asset_class, exchange, source, updated_at FROM assets ${where} ORDER BY symbol LIMIT $${pos}`;
    const { rows } = await this.db.query<Asset>(sql, params);
    return rows;
  }

  async upsert(row: {
    symbol: string;
    name: string;
    asset_class: AssetClass;
    exchange?: string | null;
    source?: string | null;
  }): Promise<Asset> {
    const { rows } = await this.db.query<Asset>(
      `INSERT INTO assets (symbol, name, asset_class, exchange, source, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (symbol) DO UPDATE SET
         name = EXCLUDED.name,
         asset_class = EXCLUDED.asset_class,
         exchange = EXCLUDED.exchange,
         source = EXCLUDED.source,
         updated_at = NOW()
       RETURNING symbol, name, asset_class, exchange, source, updated_at`,
      [
        row.symbol,
        row.name || '',
        row.asset_class,
        row.exchange ?? null,
        row.source ?? null,
      ],
    );
    return rows[0];
  }
}
