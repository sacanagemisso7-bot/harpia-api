import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUnitDto } from './create-unit.dto';

// developmentId não muda no update — a unidade pertence ao empreendimento onde foi criada.
export class UpdateUnitDto extends PartialType(
  OmitType(CreateUnitDto, ['developmentId'] as const),
) {}
