import { Injectable, NotFoundException } from '@nestjs/common';
import { InvestorStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';

@Injectable()
export class InvestorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    status?: InvestorStatus,
    search?: string,
  ) {
    const where: Prisma.InvestorWhereInput = { organizationId };
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    return this.prisma.investor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const investor = await this.prisma.investor.findFirst({
      where: { id, organizationId },
      include: { investments: true, interactions: true },
    });
    if (!investor) throw new NotFoundException('Investidor não encontrado');
    return investor;
  }

  async create(organizationId: string, dto: CreateInvestorDto) {
    return this.prisma.investor.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        status: dto.status,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
        notes: dto.notes,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateInvestorDto) {
    await this.findOne(id, organizationId);
    return this.prisma.investor.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        status: dto.status,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.investor.delete({ where: { id } });
  }
}
