import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { MarketModule } from '../../market/market.module';
import { InvestmentsController } from './investments.controller';
import { InvestmentsRepository } from './investments.repository';
import { InvestmentsService } from './investments.service';

@Module({
  imports: [AuthModule, MarketModule],
  controllers: [InvestmentsController],
  providers: [InvestmentsService, InvestmentsRepository],
})
export class InvestmentsModule {}
