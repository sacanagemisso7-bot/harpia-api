import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { PriceTablesService } from './price-tables.service';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
}

@Controller('unit-prices')
export class UnitPricesController {
  constructor(private readonly priceTablesService: PriceTablesService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUnitPriceDto,
  ) {
    return this.priceTablesService.updatePrice(id, user.organizationId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.priceTablesService.removePrice(id, user.organizationId);
  }
}
