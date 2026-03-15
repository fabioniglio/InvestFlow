import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketService } from '../../market/market.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import {
  Investment,
  InvestmentFilters,
  InvestmentsRepository,
  PortfolioSummaryRow,
} from './investments.repository';

export interface PortfolioValueRow extends PortfolioSummaryRow {
  asset_name?: string | null;
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

  findAll(userId: string, filters: InvestmentFilters): Promise<Investment[]> {
    return this.repo.findAll(userId, filters);
  }

  async findOne(userId: string, id: string): Promise<Investment> {
    const investment = await this.repo.findOne(userId, id);
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
    return investment;
  }

  create(userId: string, dto: CreateInvestmentDto): Promise<Investment> {
    return this.repo.create(userId, dto);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateInvestmentDto,
  ): Promise<Investment> {
    const updated = await this.repo.update(userId, id, dto);
    if (!updated) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await this.repo.delete(userId, id);
    if (!deleted) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
  }

  getPortfolioSummary(userId: string): Promise<PortfolioSummaryRow[]> {
    return this.repo.getPortfolioSummary(userId);
  }

  async getPortfolioValue(userId: string): Promise<PortfolioValueRow[]> {
    const summary = await this.repo.getPortfolioSummary(userId);

    return Promise.all(
      summary.map(async (asset) => {
        const [quoteResult, assetName] = await Promise.all([
          this.market.getQuoteSafe(asset.asset_symbol),
          this.market.getSymbolName(asset.asset_symbol),
        ]);
        const { quote, error: quoteError } = quoteResult;
        const quantityHeld = Number(asset.quantity_held);
        const totalInvested = Number(asset.total_invested);

        if (!quote) {
          return {
            ...asset,
            asset_name: assetName ?? undefined,
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
          asset_name: assetName ?? undefined,
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
