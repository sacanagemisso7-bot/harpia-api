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
import { ReturnStatus } from '@prisma/client';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
}

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('investmentId') investmentId?: string,
    @Query('status') status?: ReturnStatus,
  ) {
    return this.returnsService.findAll(
      user.organizationId,
      investmentId,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.returnsService.findOne(id, user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateReturnDto,
  ) {
    return this.returnsService.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.returnsService.remove(id, user.organizationId);
  }
}
