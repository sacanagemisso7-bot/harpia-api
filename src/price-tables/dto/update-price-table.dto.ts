import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePriceTableDto } from './create-price-table.dto';

// developmentId não muda no update — a tabela pertence ao empreendimento onde foi criada.
export class UpdatePriceTableDto extends PartialType(
  OmitType(CreatePriceTableDto, ['developmentId'] as const),
) {}
