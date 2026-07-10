import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateUnitTypeDto {
  @IsString()
  developmentId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  suites?: number;

  @IsOptional()
  @IsNumber()
  standardArea?: number;
}
