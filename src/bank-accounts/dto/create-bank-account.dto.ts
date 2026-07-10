import { IsOptional, IsString } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  bank: string;

  @IsString()
  agency: string;

  @IsString()
  account: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
