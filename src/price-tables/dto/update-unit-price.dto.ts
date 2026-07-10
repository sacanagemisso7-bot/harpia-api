import { IsNumber, IsPositive } from 'class-validator';

export class UpdateUnitPriceDto {
  @IsNumber()
  @IsPositive()
  value: number;
}
