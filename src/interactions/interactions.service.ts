import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';

const personSelect = { select: { id: true, name: true } };

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, personId?: string) {
    const where: Prisma.InteractionWhereInput = { organizationId };
    if (personId) where.personId = personId;

    return this.prisma.interaction.findMany({
      where,
      include: { person: personSelect },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const interaction = await this.prisma.interaction.findFirst({
      where: { id, organizationId },
      include: { person: personSelect },
    });
    if (!interaction) throw new NotFoundException('Interação não encontrada');
    return interaction;
  }

  async create(organizationId: string, dto: CreateInteractionDto) {
    await this.assertPersonInOrg(dto.personId, organizationId);

    return this.prisma.interaction.create({
      data: {
        organizationId,
        personId: dto.personId,
        date: new Date(dto.date),
        type: dto.type,
        summary: dto.summary,
        nextStep: dto.nextStep,
      },
      include: { person: personSelect },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateInteractionDto) {
    await this.ensureExists(id, organizationId);

    return this.prisma.interaction.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        type: dto.type,
        summary: dto.summary,
        nextStep: dto.nextStep,
      },
      include: { person: personSelect },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.ensureExists(id, organizationId);
    return this.prisma.interaction.delete({ where: { id } });
  }

  private async ensureExists(id: string, organizationId: string) {
    const interaction = await this.prisma.interaction.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!interaction) throw new NotFoundException('Interação não encontrada');
  }

  private async assertPersonInOrg(personId: string, organizationId: string) {
    const person = await this.prisma.person.findFirst({
      where: { id: personId, organizationId },
      select: { id: true },
    });
    if (!person) {
      throw new BadRequestException('Pessoa inválida para esta organização');
    }
  }
}
