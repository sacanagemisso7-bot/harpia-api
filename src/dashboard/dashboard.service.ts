import { Injectable } from '@nestjs/common';
import { InvestorStatus, ReturnStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(organizationId: string) {
    const now = new Date();

    const [
      captacao,
      totalInvestidores,
      pendentes,
      atrasados,
      ultimasInteracoes,
    ] = await Promise.all([
      this.prisma.investment.aggregate({
        where: { organizationId },
        _sum: { amount: true },
      }),
      this.prisma.investor.count({
        where: { organizationId, status: InvestorStatus.ATIVO },
      }),
      this.prisma.return.aggregate({
        where: {
          organizationId,
          status: ReturnStatus.PENDENTE,
          expectedDate: { gte: now },
        },
        _count: true,
        _sum: { expectedAmount: true },
      }),
      this.prisma.return.aggregate({
        where: {
          organizationId,
          status: ReturnStatus.PENDENTE,
          expectedDate: { lt: now },
        },
        _count: true,
        _sum: { expectedAmount: true },
      }),
      this.prisma.interaction.findMany({
        where: { organizationId },
        orderBy: { date: 'desc' },
        take: 5,
        include: { investor: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      totalCaptado: captacao._sum.amount ?? 0,
      totalInvestidores,
      retornosPendentes: {
        count: pendentes._count,
        valor: pendentes._sum.expectedAmount ?? 0,
      },
      retornosAtrasados: {
        count: atrasados._count,
        valor: atrasados._sum.expectedAmount ?? 0,
      },
      ultimasInteracoes,
    };
  }
}
