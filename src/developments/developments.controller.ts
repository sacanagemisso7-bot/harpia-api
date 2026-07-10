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
import { DevelopmentStatus, DevelopmentType } from '@prisma/client';
import { DevelopmentsService } from './developments.service';
import { CreateDevelopmentDto } from './dto/create-development.dto';
import { UpdateDevelopmentDto } from './dto/update-development.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
}

@Controller('developments')
export class DevelopmentsController {
  constructor(private readonly developmentsService: DevelopmentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: DevelopmentStatus,
    @Query('type') type?: DevelopmentType,
    @Query('companyId') companyId?: string,
  ) {
    return this.developmentsService.findAll(
      user.organizationId,
      status,
      type,
      companyId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.developmentsService.findOne(id, user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDevelopmentDto) {
    return this.developmentsService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateDevelopmentDto,
  ) {
    return this.developmentsService.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.developmentsService.remove(id, user.organizationId);
  }
}
