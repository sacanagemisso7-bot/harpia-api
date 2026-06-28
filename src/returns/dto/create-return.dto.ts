import { ReturnStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateReturnDto {
  @IsNumber()
  @IsPositive()
  expectedAmount: number;

  @IsDateString()
  expectedDate: string;

  @IsString()
  investmentId: string;

  @IsOptional()
  @IsDateString()
  realizedDate?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  realizedAmount?: number;

  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;
}
