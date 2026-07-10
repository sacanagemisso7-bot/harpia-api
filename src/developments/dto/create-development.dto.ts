import { DevelopmentStatus, DevelopmentType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDevelopmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DevelopmentType)
  type: DevelopmentType;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(DevelopmentStatus)
  status?: DevelopmentStatus;

  @IsOptional()
  @IsDateString()
  expectedLaunchDate?: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}
