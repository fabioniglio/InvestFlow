import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly service: InvestmentsService) {}

  @Get('portfolio/summary')
  getPortfolioSummary(@CurrentUser() user: { id: string; email: string }) {
    return this.service.getPortfolioSummary(user.id);
  }

  @Get('portfolio/value')
  getPortfolioValue(@CurrentUser() user: { id: string; email: string }) {
    return this.service.getPortfolioValue(user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string; email: string },
    @Query('asset') asset?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findAll(user.id, {
      asset_symbol: asset,
      type,
      from,
      to,
    });
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string; email: string }, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: { id: string; email: string }, @Body() dto: CreateInvestmentDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string; email: string },
    @Param('id') id: string,
    @Body() dto: UpdateInvestmentDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: { id: string; email: string }, @Param('id') id: string) {
    return this.service.delete(user.id, id);
  }
}
