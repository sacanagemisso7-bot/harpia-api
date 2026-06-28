import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Return, ReturnStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    investmentId?: string,
    status?: ReturnStatus,
  ) {
    const where: Prisma.ReturnWhereInput = { organizationId };
    if (investmentId) where.investmentId = investmentId;
    if (status) where.status = status;

    const returns = await this.prisma.return.findMany({
      where,
      orderBy: { expectedDate: 'asc' },
    });

    return returns.map((r) => this.withComputedStatus(r));
  }

  async findOne(id: string, organizationId: string) {
    const found = await this.prisma.return.findFirst({
      where: { id, organizationId },
    });
    if (!found) throw new NotFoundException('Retorno não encontrado');
    return this.withComputedStatus(found);
  }

  async create(organizationId: string, dto: CreateReturnDto) {
    await this.assertInvestmentInOrg(dto.investmentId, organizationId);

    return this.prisma.return.create({
      data: {
        expectedAmount: dto.expectedAmount,
        expectedDate: new Date(dto.expectedDate),
        realizedDate: dto.realizedDate ? new Date(dto.realizedDate) : undefined,
        realizedAmount: dto.realizedAmount,
        status: dto.status,
        investmentId: dto.investmentId,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateReturnDto) {
    const existing = await this.prisma.return.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('Retorno não encontrado');

    if (dto.investmentId) {
      await this.assertInvestmentInOrg(dto.investmentId, organizationId);
    }

    // Quando marcado como PAGO, realizedDate e realizedAmount precisam existir
    // (no payload ou já presentes no registro).
    if (dto.status === ReturnStatus.PAGO) {
      const realizedDate = dto.realizedDate ?? existing.realizedDate;
      const realizedAmount = dto.realizedAmount ?? existing.realizedAmount;
      if (!realizedDate || realizedAmount == null) {
        throw new BadRequestException(
          'realizedDate e realizedAmount são obrigatórios quando status é PAGO',
        );
      }
    }

    return this.prisma.return.update({
      where: { id },
      data: {
        expectedAmount: dto.expectedAmount,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        realizedDate: dto.realizedDate ? new Date(dto.realizedDate) : undefined,
        realizedAmount: dto.realizedAmount,
        status: dto.status,
        investmentId: dto.investmentId,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const existing = await this.prisma.return.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('Retorno não encontrado');
    return this.prisma.return.delete({ where: { id } });
  }

  private withComputedStatus(r: Return): Return {
    if (r.status === ReturnStatus.PENDENTE && r.expectedDate < new Date()) {
      return { ...r, status: ReturnStatus.ATRASADO };
    }
    return r;
  }

  private async assertInvestmentInOrg(
    investmentId: string,
    organizationId: string,
  ) {
    const investment = await this.prisma.investment.findFirst({
      where: { id: investmentId, organizationId },
    });
    if (!investment) {
      throw new BadRequestException('Aporte inválido para esta organização');
    }
  }
}
