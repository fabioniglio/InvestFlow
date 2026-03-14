import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketService } from '../../market/market.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import {
  Investment,
  InvestmentFilters,
  InvestmentsRepository,
  PortfolioSummaryRow,
} from './investments.repository';

export interface PortfolioValueRow extends PortfolioSummaryRow {
  current_price: number | null;
  current_value: number | null;
  pnl: number | null;
  pnl_percent: number | null;
  daily_change: number | null;
  daily_change_percent: number | null;
  quote_error?: string;
}

@Injectable()
export class InvestmentsService {
  constructor(
    private readonly repo: InvestmentsRepository,
    private readonly market: MarketService,
  ) {}

  findAll(filters: InvestmentFilters): Promise<Investment[]> {
    return this.repo.findAll(filters);
  }

  async findOne(id: string): Promise<Investment> {
    const investment = await this.repo.findOne(id);
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
    return investment;
  }

  create(dto: CreateInvestmentDto): Promise<Investment> {
    return this.repo.create(dto);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
  }

  getPortfolioSummary(): Promise<PortfolioSummaryRow[]> {
    return this.repo.getPortfolioSummary();
  }

  async getPortfolioValue(): Promise<PortfolioValueRow[]> {
    const summary = await this.repo.getPortfolioSummary();

    return Promise.all(
      summary.map(async (asset) => {
        const { quote, error: quoteError } = await this.market.getQuoteSafe(
          asset.asset_symbol,
        );
        const quantityHeld = Number(asset.quantity_held);
        const totalInvested = Number(asset.total_invested);

        if (!quote) {
          return {
            ...asset,
            current_price: null,
            current_value: null,
            pnl: null,
            pnl_percent: null,
            daily_change: null,
            daily_change_percent: null,
            quote_error: quoteError ?? undefined,
          };
        }

        const currentValue = quantityHeld * quote.price;
        const pnl = currentValue - totalInvested;

        return {
          ...asset,
          current_price: quote.price,
          current_value: currentValue,
          pnl,
          pnl_percent: totalInvested > 0 ? (pnl / totalInvested) * 100 : 0,
          daily_change: quote.change,
          daily_change_percent: quote.changePercent,
        };
      }),
    );
  }
}
