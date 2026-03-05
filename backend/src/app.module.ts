import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MarketModule } from './market/market.module';
import { InvestmentsModule } from './modules/investments/investments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MarketModule,
    InvestmentsModule,
  ],
})
export class AppModule {}
