import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  investmentId: string;

  @IsOptional()
  @IsString()
  developmentId?: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
