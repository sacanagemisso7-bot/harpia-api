import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateInteractionDto } from './create-interaction.dto';

// personId não muda no update — a interação pertence à pessoa registrada.
export class UpdateInteractionDto extends PartialType(
  OmitType(CreateInteractionDto, ['personId'] as const),
) {}
