import { UnitCategory, UnitStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateUnitDto {
  @IsString()
  developmentId: string;

  @IsString()
  identifier: string;

  @IsOptional()
  @IsString()
  unitTypeId?: string;

  @IsEnum(UnitCategory)
  category: UnitCategory;

  @IsOptional()
  @IsString()
  grouping?: string;

  @IsOptional()
  @IsNumber()
  landArea?: number;

  @IsOptional()
  @IsNumber()
  builtArea?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  parkingSpots?: number;

  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
