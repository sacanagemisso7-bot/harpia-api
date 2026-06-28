import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpa os dados em ordem segura de FK para permitir re-execução.
  await prisma.document.deleteMany();
  await prisma.return.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Organization
  const org = await prisma.organization.create({
    data: { name: 'Harpia Demo' },
  });

  // User admin
  await prisma.user.create({
    data: {
      email: 'admin@harpia.com',
      password: await bcrypt.hash('harpia123', 10),
      name: 'Admin Harpia',
      organizationId: org.id,
    },
  });

  // Projects
  const aurora = await prisma.project.create({
    data: {
      name: 'Residencial Aurora',
      status: 'EM_CAPTACAO',
      location: 'Curitiba PR',
      organizationId: org.id,
    },
  });
  const horizonte = await prisma.project.create({
    data: {
      name: 'Torre Horizonte',
      status: 'EM_OBRA',
      location: 'São Paulo SP',
      organizationId: org.id,
    },
  });

  // Investors
  const joao = await prisma.investor.create({
    data: {
      name: 'João Mendes',
      email: 'joao@email.com',
      status: 'ATIVO',
      organizationId: org.id,
    },
  });
  const maria = await prisma.investor.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@email.com',
      status: 'ATIVO',
      organizationId: org.id,
    },
  });
  await prisma.investor.create({
    data: {
      name: 'Carlos Braga',
      email: 'carlos@email.com',
      status: 'PROSPECTO',
      organizationId: org.id,
    },
  });
  const carlos = await prisma.investor.findFirstOrThrow({
    where: { email: 'carlos@email.com', organizationId: org.id },
  });

  // Investments
  const invJoaoAurora = await prisma.investment.create({
    data: {
      amount: 250000,
      type: 'FINANCEIRO',
      date: new Date('2026-01-15'),
      investorId: joao.id,
      projectId: aurora.id,
      organizationId: org.id,
    },
  });
  const invMariaHorizonte = await prisma.investment.create({
    data: {
      amount: 180000,
      type: 'FINANCEIRO',
      date: new Date('2026-02-10'),
      investorId: maria.id,
      projectId: horizonte.id,
      organizationId: org.id,
    },
  });
  const invJoaoHorizonte = await prisma.investment.create({
    data: {
      amount: 100000,
      type: 'PERMUTA',
      date: new Date('2026-03-05'),
      investorId: joao.id,
      projectId: horizonte.id,
      organizationId: org.id,
    },
  });

  // Returns
  await prisma.return.createMany({
    data: [
      {
        expectedAmount: 30000,
        expectedDate: new Date('2026-08-15'),
        status: 'PENDENTE',
        investmentId: invJoaoAurora.id,
        organizationId: org.id,
      },
      {
        expectedAmount: 30000,
        expectedDate: new Date('2025-12-01'),
        status: 'PENDENTE',
        investmentId: invJoaoAurora.id,
        organizationId: org.id,
      },
      {
        expectedAmount: 25000,
        expectedDate: new Date('2026-09-20'),
        status: 'PENDENTE',
        investmentId: invMariaHorizonte.id,
        organizationId: org.id,
      },
      {
        expectedAmount: 15000,
        expectedDate: new Date('2026-05-10'),
        status: 'PAGO',
        realizedDate: new Date('2026-05-10'),
        realizedAmount: 15500,
        investmentId: invJoaoHorizonte.id,
        organizationId: org.id,
      },
    ],
  });

  // Interactions
  await prisma.interaction.createMany({
    data: [
      {
        type: 'REUNIAO',
        date: new Date('2026-06-15'),
        summary: 'Apresentação do projeto Aurora',
        investorId: joao.id,
        organizationId: org.id,
      },
      {
        type: 'WHATSAPP',
        date: new Date('2026-06-20'),
        summary: 'Confirmação de aporte',
        investorId: maria.id,
        organizationId: org.id,
      },
      {
        type: 'LIGACAO',
        date: new Date('2026-06-25'),
        summary: 'Primeiro contato - interesse em investir',
        investorId: carlos.id,
        organizationId: org.id,
      },
    ],
  });

  console.log('Seed concluído: organização "Harpia Demo" criada com dados de exemplo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
