import { Module } from '@nestjs/common';
import { DevelopmentsController } from './developments.controller';
import { DevelopmentsService } from './developments.service';

@Module({
  controllers: [DevelopmentsController],
  providers: [DevelopmentsService],
})
export class DevelopmentsModule {}
