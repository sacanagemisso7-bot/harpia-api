import { InteractionType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateInteractionDto {
  @IsString()
  personId: string;

  @IsDateString()
  date: string;

  @IsEnum(InteractionType)
  type: InteractionType;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  nextStep?: string;
}
