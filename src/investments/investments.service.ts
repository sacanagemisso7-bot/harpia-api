import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonRoleType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

// Investment com allocations incluídas + nome do development de cada uma.
type InvestmentWithAllocations = Prisma.InvestmentGetPayload<{
  include: {
    investor: { select: { id: true; name: true } };
    allocations: {
      include: { development: { select: { id: true; name: true } } };
    };
  };
}>;

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, investorId?: string) {
    const where: Prisma.InvestmentWhereInput = { organizationId };
    if (investorId) where.investorId = investorId;

    const investments = await this.prisma.investment.findMany({
      where,
      include: {
        investor: { select: { id: true, name: true } },
        allocations: {
          include: { development: { select: { id: true, name: true } } },
        },
      },
      orderBy: { date: 'desc' },
    });

    return investments.map((i) => this.withComputedAmounts(i));
  }

  async findOne(id: string, organizationId: string) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, organizationId },
      include: {
        investor: { select: { id: true, name: true } },
        allocations: {
          include: {
            development: { select: { id: true, name: true } },
            returns: true,
          },
        },
      },
    });
    if (!investment) throw new NotFoundException('Aporte não encontrado');

    const allocatedAmount = this.sumAllocatedToDevelopment(
      investment.allocations,
    );
    return {
      ...investment,
      allocatedAmount,
      unallocatedAmount: investment.amount - allocatedAmount,
    };
  }

  async create(organizationId: string, dto: CreateInvestmentDto) {
    await this.assertInvestor(dto.investorId, organizationId);

    return this.prisma.investment.create({
      data: {
        organizationId,
        investorId: dto.investorId,
        amount: dto.amount,
        date: new Date(dto.date),
        type: dto.type,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateInvestmentDto) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, organizationId },
      include: { allocations: { select: { amount: true } } },
    });
    if (!investment) throw new NotFoundException('Aporte não encontrado');

    // Reduzir o valor total abaixo do já alocado deixaria as alocações inconsistentes.
    if (dto.amount != null) {
      const allocated = investment.allocations.reduce(
        (sum, a) => sum + a.amount,
        0,
      );
      if (dto.amount < allocated) {
        throw new BadRequestException(
          `Valor do aporte não pode ser menor que o total já alocado (R$ ${allocated})`,
        );
      }
    }

    return this.prisma.investment.update({
      where: { id },
      data: {
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        type: dto.type,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!investment) throw new NotFoundException('Aporte não encontrado');
    // Allocation.investmentId é Cascade, e Return.allocationId também — tudo é removido.
    return this.prisma.investment.delete({ where: { id } });
  }

  private withComputedAmounts(investment: InvestmentWithAllocations) {
    const allocatedAmount = this.sumAllocatedToDevelopment(
      investment.allocations,
    );
    return {
      ...investment,
      allocatedAmount,
      unallocatedAmount: investment.amount - allocatedAmount,
    };
  }

  // "Alocado" = destinado a um empreendimento. Alocações em caixa geral
  // (developmentId null) contam como não-alocado (unallocatedAmount).
  private sumAllocatedToDevelopment(
    allocations: { amount: number; developmentId: string | null }[],
  ) {
    return allocations
      .filter((a) => a.developmentId != null)
      .reduce((sum, a) => sum + a.amount, 0);
  }

  private async assertInvestor(personId: string, organizationId: string) {
    const person = await this.prisma.person.findFirst({
      where: { id: personId, organizationId },
      select: { id: true },
    });
    if (!person) {
      throw new BadRequestException('Investidor inválido para esta organização');
    }

    const investorRole = await this.prisma.personRole.findUnique({
      where: {
        personId_role: { personId, role: PersonRoleType.INVESTIDOR },
      },
      select: { id: true },
    });
    if (!investorRole) {
      throw new BadRequestException(
        'A pessoa não possui o papel INVESTIDOR e não pode receber aportes',
      );
    }
  }
}
