import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

  async findAll(adegaId: string) {
    return this.prisma.campaign.findMany({
      where: { adegaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(data: {
    adegaId: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isRecurring?: boolean;
  }) {
    return this.prisma.campaign.create({
      data: {
        adegaId: data.adegaId,
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isRecurring: data.isRecurring || false,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.campaign.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.campaign.delete({ where: { id } });
    return { message: 'Campaign deleted' };
  }
}
