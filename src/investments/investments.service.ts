import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    investorId?: string,
    projectId?: string,
  ) {
    const where: Prisma.InvestmentWhereInput = { organizationId };
    if (investorId) where.investorId = investorId;
    if (projectId) where.projectId = projectId;

    return this.prisma.investment.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, organizationId },
      include: { returns: true, documents: true },
    });
    if (!investment) throw new NotFoundException('Aporte não encontrado');
    return investment;
  }

  async create(organizationId: string, dto: CreateInvestmentDto) {
    await this.assertInvestorInOrg(dto.investorId, organizationId);
    await this.assertProjectInOrg(dto.projectId, organizationId);

    return this.prisma.investment.create({
      data: {
        amount: dto.amount,
        date: new Date(dto.date),
        type: dto.type,
        notes: dto.notes,
        investorId: dto.investorId,
        projectId: dto.projectId,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateInvestmentDto) {
    await this.findOne(id, organizationId);
    if (dto.investorId) {
      await this.assertInvestorInOrg(dto.investorId, organizationId);
    }
    if (dto.projectId) {
      await this.assertProjectInOrg(dto.projectId, organizationId);
    }

    return this.prisma.investment.update({
      where: { id },
      data: {
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        type: dto.type,
        notes: dto.notes,
        investorId: dto.investorId,
        projectId: dto.projectId,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.investment.delete({ where: { id } });
  }

  private async assertInvestorInOrg(investorId: string, organizationId: string) {
    const investor = await this.prisma.investor.findFirst({
      where: { id: investorId, organizationId },
    });
    if (!investor) {
      throw new BadRequestException('Investidor inválido para esta organização');
    }
  }

  private async assertProjectInOrg(projectId: string, organizationId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });
    if (!project) {
      throw new BadRequestException('Projeto inválido para esta organização');
    }
  }
}
