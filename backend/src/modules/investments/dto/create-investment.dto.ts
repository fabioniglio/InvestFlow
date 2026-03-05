import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export type InvestmentType = 'buy' | 'sell' | 'dividend';

export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  asset_symbol: string;

  @IsEnum(['buy', 'sell', 'dividend'])
  type: InvestmentType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
