import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MarketModule } from './market/market.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { AssetsModule } from './modules/assets/assets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    MarketModule,
    InvestmentsModule,
    AssetsModule,
  ],
})
export class AppModule {}
