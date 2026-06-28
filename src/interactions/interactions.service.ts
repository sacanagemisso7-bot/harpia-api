import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, investorId?: string) {
    const where: Prisma.InteractionWhereInput = { organizationId };
    if (investorId) where.investorId = investorId;

    return this.prisma.interaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const interaction = await this.prisma.interaction.findFirst({
      where: { id, organizationId },
    });
    if (!interaction) throw new NotFoundException('Interação não encontrada');
    return interaction;
  }

  async create(organizationId: string, dto: CreateInteractionDto) {
    await this.assertInvestorInOrg(dto.investorId, organizationId);

    return this.prisma.interaction.create({
      data: {
        date: new Date(dto.date),
        type: dto.type,
        summary: dto.summary,
        nextStep: dto.nextStep,
        investorId: dto.investorId,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateInteractionDto) {
    await this.findOne(id, organizationId);
    if (dto.investorId) {
      await this.assertInvestorInOrg(dto.investorId, organizationId);
    }

    return this.prisma.interaction.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        type: dto.type,
        summary: dto.summary,
        nextStep: dto.nextStep,
        investorId: dto.investorId,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.interaction.delete({ where: { id } });
  }

  private async assertInvestorInOrg(
    investorId: string,
    organizationId: string,
  ) {
    const investor = await this.prisma.investor.findFirst({
      where: { id: investorId, organizationId },
    });
    if (!investor) {
      throw new BadRequestException('Investidor inválido para esta organização');
    }
  }
}
