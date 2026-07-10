import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    investmentId?: string,
    developmentId?: string,
  ) {
    const where: Prisma.AllocationWhereInput = { organizationId };
    if (investmentId) where.investmentId = investmentId;
    if (developmentId) where.developmentId = developmentId;

    return this.prisma.allocation.findMany({
      where,
      include: {
        development: { select: { id: true, name: true } },
        investment: {
          select: { id: true, amount: true, investorId: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const allocation = await this.prisma.allocation.findFirst({
      where: { id, organizationId },
      include: {
        development: { select: { id: true, name: true } },
        investment: { select: { id: true, amount: true } },
        returns: true,
      },
    });
    if (!allocation) throw new NotFoundException('Alocação não encontrada');
    return allocation;
  }

  async create(organizationId: string, dto: CreateAllocationDto) {
    const investment = await this.getInvestmentInOrg(
      dto.investmentId,
      organizationId,
    );
    if (dto.developmentId) {
      await this.assertDevelopmentInOrg(dto.developmentId, organizationId);
    }

    await this.assertWithinBudget(
      dto.investmentId,
      investment.amount,
      dto.amount,
    );

    return this.prisma.allocation.create({
      data: {
        organizationId,
        investmentId: dto.investmentId,
        developmentId: dto.developmentId ?? null,
        amount: dto.amount,
        date: new Date(dto.date),
        notes: dto.notes,
      },
      include: { development: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateAllocationDto) {
    const allocation = await this.prisma.allocation.findFirst({
      where: { id, organizationId },
      include: { investment: { select: { amount: true } } },
    });
    if (!allocation) throw new NotFoundException('Alocação não encontrada');

    if (dto.developmentId) {
      await this.assertDevelopmentInOrg(dto.developmentId, organizationId);
    }

    // Revalida a soma quando o valor muda, ignorando a própria alocação.
    if (dto.amount != null) {
      await this.assertWithinBudget(
        allocation.investmentId,
        allocation.investment.amount,
        dto.amount,
        id,
      );
    }

    return this.prisma.allocation.update({
      where: { id },
      data: {
        developmentId: dto.developmentId,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        notes: dto.notes,
      },
      include: { development: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, organizationId: string) {
    const allocation = await this.prisma.allocation.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!allocation) throw new NotFoundException('Alocação não encontrada');
    // Return.allocationId é Cascade — os retornos da alocação são removidos.
    return this.prisma.allocation.delete({ where: { id } });
  }

  private async getInvestmentInOrg(investmentId: string, organizationId: string) {
    const investment = await this.prisma.investment.findFirst({
      where: { id: investmentId, organizationId },
      select: { id: true, amount: true },
    });
    if (!investment) {
      throw new BadRequestException('Aporte inválido para esta organização');
    }
    return investment;
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

  // Garante que a soma das alocações não ultrapasse o valor total do aporte.
  private async assertWithinBudget(
    investmentId: string,
    investmentAmount: number,
    newAmount: number,
    excludeAllocationId?: string,
  ) {
    const agg = await this.prisma.allocation.aggregate({
      where: {
        investmentId,
        ...(excludeAllocationId ? { id: { not: excludeAllocationId } } : {}),
      },
      _sum: { amount: true },
    });
    const alreadyAllocated = agg._sum.amount ?? 0;
    const available = investmentAmount - alreadyAllocated;

    if (newAmount > available) {
      throw new BadRequestException(
        `Valor excede o disponível para alocar neste aporte. Disponível: R$ ${available} (total R$ ${investmentAmount}, já alocado R$ ${alreadyAllocated})`,
      );
    }
  }
}
