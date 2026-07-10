import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PersonRoleType } from '@prisma/client';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
}

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('role') role?: PersonRoleType,
    @Query('search') search?: string,
  ) {
    return this.peopleService.findAll(user.organizationId, role, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.peopleService.findOne(id, user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePersonDto) {
    return this.peopleService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.peopleService.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.peopleService.remove(id, user.organizationId);
  }

  @Post(':id/roles')
  addRole(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: AddRoleDto,
  ) {
    return this.peopleService.addRole(id, user.organizationId, dto.role);
  }

  @Delete(':id/roles/:role')
  removeRole(
    @Param('id') id: string,
    @Param('role') role: PersonRoleType,
    @CurrentUser() user: AuthUser,
  ) {
    return this.peopleService.removeRole(id, user.organizationId, role);
  }
}
