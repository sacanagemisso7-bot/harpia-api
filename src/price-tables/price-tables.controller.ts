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
import { PriceTablesService } from './price-tables.service';
import { CreatePriceTableDto } from './dto/create-price-table.dto';
import { UpdatePriceTableDto } from './dto/update-price-table.dto';
import { SetUnitPriceDto } from './dto/set-unit-price.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
}

@Controller('price-tables')
export class PriceTablesController {
  constructor(private readonly priceTablesService: PriceTablesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('developmentId') developmentId: string,
  ) {
    return this.priceTablesService.findAll(user.organizationId, developmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.priceTablesService.findOne(id, user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePriceTableDto) {
    return this.priceTablesService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePriceTableDto,
  ) {
    return this.priceTablesService.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.priceTablesService.remove(id, user.organizationId);
  }

  // Define/atualiza o preço de uma unidade nesta tabela (upsert).
  @Post(':id/prices')
  setPrice(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SetUnitPriceDto,
  ) {
    return this.priceTablesService.setPrice(id, user.organizationId, dto);
  }
}
