import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export type AssetClass = 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'other';

export class UpdateInvestmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  asset_symbol?: string;

  @IsOptional()
  @IsEnum(['stock', 'etf', 'crypto', 'mutual_fund', 'other'])
  asset_class?: AssetClass;

  @IsOptional()
  @IsEnum(['buy', 'sell', 'dividend'])
  type?: 'buy' | 'sell' | 'dividend';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
