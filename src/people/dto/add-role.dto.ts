import { PersonRoleType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AddRoleDto {
  @IsEnum(PersonRoleType)
  role: PersonRoleType;
}
