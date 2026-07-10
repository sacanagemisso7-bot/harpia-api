import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceTableDto } from './dto/create-price-table.dto';
import { UpdatePriceTableDto } from './dto/update-price-table.dto';
import { SetUnitPriceDto } from './dto/set-unit-price.dto';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';

@Injectable()
export class PriceTablesService {
  constructor(private readonly prisma: PrismaService) {}

  // --- PriceTables -----------------------------------------------------------

  async findAll(organizationId: string, developmentId: string) {
    if (!developmentId) {
      throw new BadRequestException('developmentId é obrigatório');
    }
    await this.assertDevelopmentInOrg(developmentId, organizationId);

    return this.prisma.priceTable.findMany({
      where: { organizationId, developmentId },
      include: { _count: { select: { unitPrices: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const priceTable = await this.prisma.priceTable.findFirst({
      where: { id, organizationId },
      include: {
        unitPrices: {
          include: {
            unit: { select: { id: true, identifier: true } },
          },
          orderBy: { unit: { identifier: 'asc' } },
        },
      },
    });
    if (!priceTable) throw new NotFoundException('Tabela de preço não encontrada');
    return priceTable;
  }

  async create(organizationId: string, dto: CreatePriceTableDto) {
    await this.assertDevelopmentInOrg(dto.developmentId, organizationId);

    return this.prisma.priceTable.create({
      data: {
        organizationId,
        developmentId: dto.developmentId,
        name: dto.name,
        phase: dto.phase,
        active: dto.active,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdatePriceTableDto) {
    await this.ensureTableExists(id, organizationId);

    return this.prisma.priceTable.update({
      where: { id },
      data: { name: dto.name, phase: dto.phase, active: dto.active },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.ensureTableExists(id, organizationId);
    // UnitPrice.priceTableId é onDelete Cascade — os preços da tabela são removidos.
    return this.prisma.priceTable.delete({ where: { id } });
  }

  // --- UnitPrices ------------------------------------------------------------

  async setPrice(
    priceTableId: string,
    organizationId: string,
    dto: SetUnitPriceDto,
  ) {
    const table = await this.prisma.priceTable.findFirst({
      where: { id: priceTableId, organizationId },
      select: { id: true, developmentId: true },
    });
    if (!table) throw new NotFoundException('Tabela de preço não encontrada');

    // A unidade precisa existir na org e pertencer ao mesmo empreendimento da tabela.
    const unit = await this.prisma.unit.findFirst({
      where: {
        id: dto.unitId,
        organizationId,
        developmentId: table.developmentId,
      },
      select: { id: true },
    });
    if (!unit) {
      throw new BadRequestException(
        'Unidade inválida para o empreendimento desta tabela',
      );
    }

    return this.prisma.unitPrice.upsert({
      where: {
        unitId_priceTableId: { unitId: dto.unitId, priceTableId },
      },
      create: {
        organizationId,
        unitId: dto.unitId,
        priceTableId,
        value: dto.value,
      },
      update: { value: dto.value },
    });
  }

  async updatePrice(
    id: string,
    organizationId: string,
    dto: UpdateUnitPriceDto,
  ) {
    await this.ensurePriceExists(id, organizationId);
    return this.prisma.unitPrice.update({
      where: { id },
      data: { value: dto.value },
    });
  }

  async removePrice(id: string, organizationId: string) {
    await this.ensurePriceExists(id, organizationId);
    return this.prisma.unitPrice.delete({ where: { id } });
  }

  // --- helpers ---------------------------------------------------------------

  private async ensureTableExists(id: string, organizationId: string) {
    const table = await this.prisma.priceTable.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!table) throw new NotFoundException('Tabela de preço não encontrada');
  }

  private async ensurePriceExists(id: string, organizationId: string) {
    const price = await this.prisma.unitPrice.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!price) throw new NotFoundException('Preço não encontrado');
  }

  private async assertDevelopmentInOrg(
    developmentId: string,
    organizationId: string,
  ) {
    const development = await this.prisma.development.findFirst({
      where: { id: developmentId, organizationId },
      select: { id: true },
    });
    if (!development) {
      throw new BadRequestException(
        'Empreendimento inválido para esta organização',
      );
    }
  }
}
