import { Module } from '@nestjs/common';
import { UnitTypesController } from './unit-types.controller';
import { UnitTypesService } from './unit-types.service';

@Module({
  controllers: [UnitTypesController],
  providers: [UnitTypesService],
})
export class UnitTypesModule {}
