import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, companyId?: string) {
    const where: Prisma.BankAccountWhereInput = { organizationId };
    if (companyId) where.companyId = companyId;

    return this.prisma.bankAccount.findMany({
      where,
      include: { company: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, organizationId },
      include: { company: { select: { id: true, name: true, type: true } } },
    });
    if (!account) throw new NotFoundException('Conta bancária não encontrada');
    return account;
  }

  async create(organizationId: string, dto: CreateBankAccountDto) {
    if (dto.companyId) {
      await this.assertCompanyInOrg(dto.companyId, organizationId);
    }

    return this.prisma.bankAccount.create({
      data: {
        organizationId,
        bank: dto.bank,
        agency: dto.agency,
        account: dto.account,
        companyId: dto.companyId,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateBankAccountDto) {
    await this.ensureExists(id, organizationId);
    if (dto.companyId) {
      await this.assertCompanyInOrg(dto.companyId, organizationId);
    }

    return this.prisma.bankAccount.update({
      where: { id },
      data: {
        bank: dto.bank,
        agency: dto.agency,
        account: dto.account,
        companyId: dto.companyId,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.ensureExists(id, organizationId);
    return this.prisma.bankAccount.delete({ where: { id } });
  }

  private async ensureExists(id: string, organizationId: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!account) throw new NotFoundException('Conta bancária não encontrada');
  }

  private async assertCompanyInOrg(companyId: string, organizationId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, organizationId },
      select: { id: true },
    });
    if (!company) {
      throw new BadRequestException('Empresa inválida para esta organização');
    }
  }
}
