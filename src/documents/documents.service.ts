import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    investorId?: string,
    investmentId?: string,
  ) {
    const where: Prisma.DocumentWhereInput = { organizationId };
    if (investorId) where.investorId = investorId;
    if (investmentId) where.investmentId = investmentId;

    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, organizationId },
    });
    if (!document) throw new NotFoundException('Documento não encontrado');
    return document;
  }

  async create(
    organizationId: string,
    dto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Arquivo é obrigatório');

    if (dto.investorId) {
      await this.assertInvestorInOrg(dto.investorId, organizationId);
    }
    if (dto.investmentId) {
      await this.assertInvestmentInOrg(dto.investmentId, organizationId);
    }

    return this.prisma.document.create({
      data: {
        name: dto.name,
        fileUrl: `uploads/${file.filename}`,
        category: dto.category,
        investorId: dto.investorId,
        investmentId: dto.investmentId,
        organizationId,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const document = await this.findOne(id, organizationId);

    const filePath = join(process.cwd(), document.fileUrl);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    return this.prisma.document.delete({ where: { id } });
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
