import { InteractionType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateInteractionDto {
  @IsDateString()
  date: string;

  @IsEnum(InteractionType)
  type: InteractionType;

  @IsString()
  summary: string;

  @IsString()
  investorId: string;

  @IsOptional()
  @IsString()
  nextStep?: string;
}
