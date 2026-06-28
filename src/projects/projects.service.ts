import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, status?: ProjectStatus) {
    const where: Prisma.ProjectWhereInput = { organizationId };
    if (status) where.status = status;

    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId },
      include: { investments: true },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project;
  }

  async create(organizationId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        location: dto.location,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateProjectDto) {
    await this.findOne(id, organizationId);
    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        location: dto.location,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.project.delete({ where: { id } });
  }
}
