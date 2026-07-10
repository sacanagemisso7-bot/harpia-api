import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateInvestmentDto } from './create-investment.dto';

// investorId não muda no update — o aporte pertence ao investidor que o fez.
export class UpdateInvestmentDto extends PartialType(
  OmitType(CreateInvestmentDto, ['investorId'] as const),
) {}
