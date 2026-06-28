import { InvestmentType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateInvestmentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(InvestmentType)
  type?: InvestmentType;

  @IsString()
  investorId: string;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
