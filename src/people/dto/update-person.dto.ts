import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './create-person.dto';

// Papéis não são atualizados aqui — têm endpoints próprios (/people/:id/roles).
export class UpdatePersonDto extends PartialType(
  OmitType(CreatePersonDto, ['roles'] as const),
) {}
