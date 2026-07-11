import { Injectable } from '@nestjs/common';
import { PersonRoleType, ReturnStatus, UnitStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(organizationId: string) {
    const now = new Date();

    const [
      captado,
      alocado,
      caixaGeral,
      totalInvestidores,
      pendentes,
      atrasados,
      pagos,
      totalEmpreendimentos,
      empreendimentosPorStatusRaw,
      totalUnidades,
      unidadesPorStatusRaw,
      vendas,
      captacaoRaw,
      developments,
      ultimasInteracoes,
    ] = await Promise.all([
      // Captação e investimento
      this.prisma.investment.aggregate({
        where: { organizationId },
        _sum: { amount: true },
      }),
      this.prisma.allocation.aggregate({
        where: { organizationId, developmentId: { not: null } },
        _sum: { amount: true },
      }),
      this.prisma.allocation.aggregate({
        where: { organizationId, developmentId: null },
        _sum: { amount: true },
      }),
      this.prisma.personRole.count({
        where: { organizationId, role: PersonRoleType.INVESTIDOR },
      }),

      // Retornos
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
      this.prisma.return.aggregate({
        where: { organizationId, status: ReturnStatus.PAGO },
        _count: true,
        _sum: { realizedAmount: true },
      }),

      // Empreendimentos e unidades
      this.prisma.development.count({ where: { organizationId } }),
      this.prisma.development.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.unit.count({ where: { organizationId } }),
      this.prisma.unit.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.unitPrice.aggregate({
        where: {
          organizationId,
          unit: { status: UnitStatus.VENDIDA },
          priceTable: { active: true },
        },
        _sum: { value: true },
      }),

      // Captação por empreendimento
      this.prisma.allocation.groupBy({
        by: ['developmentId'],
        where: { organizationId, developmentId: { not: null } },
        _sum: { amount: true },
      }),
      this.prisma.development.findMany({
        where: { organizationId },
        select: { id: true, name: true },
      }),

      // Atividade recente
      this.prisma.interaction.findMany({
        where: { organizationId },
        orderBy: { date: 'desc' },
        take: 5,
        include: { person: { select: { id: true, name: true } } },
      }),
    ]);

    const developmentNames = new Map(developments.map((d) => [d.id, d.name]));

    const empreendimentosPorStatus = Object.fromEntries(
      empreendimentosPorStatusRaw.map((g) => [g.status, g._count]),
    );
    const unidadesPorStatus = Object.fromEntries(
      unidadesPorStatusRaw.map((g) => [g.status, g._count]),
    );

    const captacaoPorEmpreendimento = captacaoRaw.map((g) => ({
      developmentId: g.developmentId as string,
      nome: developmentNames.get(g.developmentId as string) ?? null,
      totalCaptado: g._sum.amount ?? 0,
    }));

    return {
      totalCaptado: captado._sum.amount ?? 0,
      totalAlocado: alocado._sum.amount ?? 0,
      totalCaixaGeral: caixaGeral._sum.amount ?? 0,
      totalInvestidores,

      retornosPendentes: {
        count: pendentes._count,
        valor: pendentes._sum.expectedAmount ?? 0,
      },
      retornosAtrasados: {
        count: atrasados._count,
        valor: atrasados._sum.expectedAmount ?? 0,
      },
      retornosPagos: {
        count: pagos._count,
        valor: pagos._sum.realizedAmount ?? 0,
      },

      totalEmpreendimentos,
      empreendimentosPorStatus,
      totalUnidades,
      unidadesPorStatus,
      valorEmVendas: vendas._sum.value ?? 0,

      captacaoPorEmpreendimento,

      ultimasInteracoes,
    };
  }
}
