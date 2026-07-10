import { IsNumber, IsPositive, IsString } from 'class-validator';

export class SetUnitPriceDto {
  @IsString()
  unitId: string;

  @IsNumber()
  @IsPositive()
  value: number;
}
