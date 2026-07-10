import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';

@Injectable()
export class UnitTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, developmentId: string) {
    if (!developmentId) {
      throw new BadRequestException('developmentId é obrigatório');
    }
    await this.assertDevelopmentInOrg(developmentId, organizationId);
    return this.prisma.unitType.findMany({
      where: { organizationId, developmentId },
      include: { _count: { select: { units: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const unitType = await this.prisma.unitType.findFirst({
      where: { id, organizationId },
      include: { units: { select: { id: true, identifier: true } } },
    });
    if (!unitType) throw new NotFoundException('Tipologia não encontrada');
    return unitType;
  }

  async create(organizationId: string, dto: CreateUnitTypeDto) {
    await this.assertDevelopmentInOrg(dto.developmentId, organizationId);

    return this.prisma.unitType.create({
      data: {
        organizationId,
        developmentId: dto.developmentId,
        name: dto.name,
        bedrooms: dto.bedrooms,
        suites: dto.suites,
        standardArea: dto.standardArea,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateUnitTypeDto) {
    await this.ensureExists(id, organizationId);

    return this.prisma.unitType.update({
      where: { id },
      data: {
        name: dto.name,
        bedrooms: dto.bedrooms,
        suites: dto.suites,
        standardArea: dto.standardArea,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.ensureExists(id, organizationId);
    // Unit.unitTypeId é onDelete SetNull no schema — as unidades ficam sem tipologia.
    return this.prisma.unitType.delete({ where: { id } });
  }

  private async ensureExists(id: string, organizationId: string) {
    const unitType = await this.prisma.unitType.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!unitType) throw new NotFoundException('Tipologia não encontrada');
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
