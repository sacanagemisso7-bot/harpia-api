import {
  PersonDocumentType,
  PersonType,
  PersonRoleType,
} from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePersonDto {
  @IsString()
  name: string;

  @IsEnum(PersonDocumentType)
  documentType: PersonDocumentType;

  @IsString()
  document: string;

  @IsEnum(PersonType)
  personType: PersonType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(PersonRoleType, { each: true })
  roles?: PersonRoleType[];
}
