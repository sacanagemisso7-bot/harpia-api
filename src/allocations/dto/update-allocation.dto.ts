import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAllocationDto } from './create-allocation.dto';

// investmentId não muda no update — a alocação pertence ao aporte de origem.
// developmentId pode ser enviado como null para mover a alocação para caixa geral.
export class UpdateAllocationDto extends PartialType(
  OmitType(CreateAllocationDto, ['investmentId'] as const),
) {}
