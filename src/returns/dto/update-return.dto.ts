import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateReturnDto } from './create-return.dto';

// allocationId não muda no update — o retorno pertence à alocação de origem.
export class UpdateReturnDto extends PartialType(
  OmitType(CreateReturnDto, ['allocationId'] as const),
) {}
