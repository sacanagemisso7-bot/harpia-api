import { Module } from '@nestjs/common';
import { PriceTablesController } from './price-tables.controller';
import { UnitPricesController } from './unit-prices.controller';
import { PriceTablesService } from './price-tables.service';

@Module({
  controllers: [PriceTablesController, UnitPricesController],
  providers: [PriceTablesService],
})
export class PriceTablesModule {}
