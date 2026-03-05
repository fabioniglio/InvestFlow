import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateInvestmentDto,
  Investment,
  PortfolioSummary,
  PortfolioValue,
} from '../models/investment.model';
import { ApiService } from './api.service';

export interface InvestmentFilters {
  asset?: string;
  type?: string;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class InvestmentsService {
  private api = inject(ApiService);

  getAll(filters: InvestmentFilters = {}): Observable<Investment[]> {
    const params: Record<string, string> = {};
    if (filters.asset) params['asset'] = filters.asset;
    if (filters.type) params['type'] = filters.type;
    if (filters.from) params['from'] = filters.from;
    if (filters.to) params['to'] = filters.to;
    return this.api.get<Investment[]>('/investments', params);
  }

  getPortfolioSummary(): Observable<PortfolioSummary[]> {
    return this.api.get<PortfolioSummary[]>('/investments/portfolio/summary');
  }

  getPortfolioValue(): Observable<PortfolioValue[]> {
    return this.api.get<PortfolioValue[]>('/investments/portfolio/value');
  }

  create(dto: CreateInvestmentDto): Observable<Investment> {
    return this.api.post<Investment>('/investments', dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/investments/${id}`);
  }
}
