import { CompanyType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  cnpj: string;

  @IsEnum(CompanyType)
  type: CompanyType;

  @IsOptional()
  @IsString()
  notes?: string;
}
