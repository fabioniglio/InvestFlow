import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../../database/database.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

export interface Investment {
  id: string;
  asset_symbol: string;
  type: 'buy' | 'sell' | 'dividend';
  quantity: number | null;
  price: number | null;
  amount: number;
  date: Date;
  notes: string | null;
  created_at: Date;
}

export interface PortfolioSummaryRow {
  asset_symbol: string;
  quantity_held: string;
  total_invested: string;
  total_sold: string;
  total_dividends: string;
  avg_buy_price: string | null;
}

export interface InvestmentFilters {
  asset_symbol?: string;
  type?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class InvestmentsRepository {
  private readonly sqlDir = path.join(__dirname, 'sql');

  constructor(private readonly db: DatabaseService) {}

  async findAll(filters: InvestmentFilters): Promise<Investment[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.asset_symbol) {
      params.push(filters.asset_symbol.toUpperCase());
      conditions.push(`asset_symbol = $${params.length}`);
    }

    if (filters.type) {
      params.push(filters.type);
      conditions.push(`type = $${params.length}`);
    }

    if (filters.from) {
      params.push(filters.from);
      conditions.push(`date >= $${params.length}`);
    }

    if (filters.to) {
      params.push(filters.to);
      conditions.push(`date <= $${params.length}`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM investments ${where} ORDER BY date DESC`;

    const { rows } = await this.db.query<Investment>(sql, params);
    return rows;
  }

  async findOne(id: string): Promise<Investment | null> {
    const { rows } = await this.db.query<Investment>(
      'SELECT * FROM investments WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateInvestmentDto): Promise<Investment> {
    const sql = fs.readFileSync(
      path.join(this.sqlDir, 'insert-investment.sql'),
      'utf8',
    );
    const { rows } = await this.db.query<Investment>(sql, [
      dto.asset_symbol.toUpperCase(),
      dto.type,
      dto.quantity ?? null,
      dto.price ?? null,
      dto.amount,
      dto.date,
      dto.notes ?? null,
    ]);
    return rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await this.db.query(
      'DELETE FROM investments WHERE id = $1',
      [id],
    );
    return (rowCount ?? 0) > 0;
  }

  async getPortfolioSummary(): Promise<PortfolioSummaryRow[]> {
    const sql = fs.readFileSync(
      path.join(this.sqlDir, 'portfolio-summary.sql'),
      'utf8',
    );
    const { rows } = await this.db.query<PortfolioSummaryRow>(sql);
    return rows;
  }
}
