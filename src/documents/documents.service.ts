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

const documentInclude = {
  person: { select: { id: true, name: true } },
  investment: { select: { id: true, amount: true } },
  unit: { select: { id: true, identifier: true } },
  development: { select: { id: true, name: true } },
} satisfies Prisma.DocumentInclude;

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    filters: {
      personId?: string;
      investmentId?: string;
      unitId?: string;
      developmentId?: string;
    },
  ) {
    const where: Prisma.DocumentWhereInput = { organizationId };
    if (filters.personId) where.personId = filters.personId;
    if (filters.investmentId) where.investmentId = filters.investmentId;
    if (filters.unitId) where.unitId = filters.unitId;
    if (filters.developmentId) where.developmentId = filters.developmentId;

    return this.prisma.document.findMany({
      where,
      include: documentInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, organizationId },
      include: documentInclude,
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

    try {
      await this.assertLinksInOrg(dto, organizationId);

      return await this.prisma.document.create({
        data: {
          organizationId,
          name: dto.name,
          fileUrl: `uploads/${file.filename}`,
          category: dto.category,
          personId: dto.personId,
          investmentId: dto.investmentId,
          unitId: dto.unitId,
          developmentId: dto.developmentId,
        },
        include: documentInclude,
      });
    } catch (e) {
      // Multer já gravou o arquivo antes da validação — remove o órfão se falhar.
      const filePath = join(process.cwd(), 'uploads', file.filename);
      if (existsSync(filePath)) unlinkSync(filePath);
      throw e;
    }
  }

  async remove(id: string, organizationId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, organizationId },
    });
    if (!document) throw new NotFoundException('Documento não encontrado');

    const filePath = join(process.cwd(), document.fileUrl);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    return this.prisma.document.delete({ where: { id } });
  }

  // Valida que cada vínculo informado pertence à organização.
  private async assertLinksInOrg(
    dto: CreateDocumentDto,
    organizationId: string,
  ) {
    if (dto.personId) {
      await this.assertInOrg(
        this.prisma.person.findFirst({
          where: { id: dto.personId, organizationId },
          select: { id: true },
        }),
        'Pessoa',
      );
    }
    if (dto.investmentId) {
      await this.assertInOrg(
        this.prisma.investment.findFirst({
          where: { id: dto.investmentId, organizationId },
          select: { id: true },
        }),
        'Aporte',
      );
    }
    if (dto.unitId) {
      await this.assertInOrg(
        this.prisma.unit.findFirst({
          where: { id: dto.unitId, organizationId },
          select: { id: true },
        }),
        'Unidade',
      );
    }
    if (dto.developmentId) {
      await this.assertInOrg(
        this.prisma.development.findFirst({
          where: { id: dto.developmentId, organizationId },
          select: { id: true },
        }),
        'Empreendimento',
      );
    }
  }

  private async assertInOrg(
    query: Promise<{ id: string } | null>,
    label: string,
  ) {
    const found = await query;
    if (!found) {
      throw new BadRequestException(`${label} inválido para esta organização`);
    }
  }
}
