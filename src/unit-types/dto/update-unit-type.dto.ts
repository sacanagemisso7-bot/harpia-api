import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUnitTypeDto } from './create-unit-type.dto';

// developmentId não muda no update — a tipologia pertence ao empreendimento onde foi criada.
export class UpdateUnitTypeDto extends PartialType(
  OmitType(CreateUnitTypeDto, ['developmentId'] as const),
) {}
