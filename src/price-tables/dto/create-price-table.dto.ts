import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePriceTableDto {
  @IsString()
  developmentId: string;

  @IsString()
  name: string;

  @IsString()
  phase: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
