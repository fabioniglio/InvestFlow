import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Asset, AssetClass } from '../models/investment.model';

export interface AssetSearchParams {
  q?: string;
  asset_class?: AssetClass;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private api = inject(ApiService);

  search(params: AssetSearchParams): Observable<Asset[]> {
    const p: Record<string, string> = {};
    if (params.q?.trim()) p['q'] = params.q.trim();
    if (params.asset_class) p['asset_class'] = params.asset_class;
    if (params.limit != null) p['limit'] = String(params.limit);
    return this.api.get<Asset[]>('/assets', p);
  }
}
