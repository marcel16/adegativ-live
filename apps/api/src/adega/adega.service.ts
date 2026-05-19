import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdegaDto } from './dto/create-adega.dto';

@Injectable()
export class AdegaService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.adega.findMany({
      where: { company: { userId } },
      include: {
        company: { select: { id: true, name: true } },
        tvDevices: { select: { id: true, name: true, platform: true, status: true, deviceToken: true, lastIp: true, lastAccessAt: true } },
      },
    });
  }

  async findById(id: string) {
    const adega = await this.prisma.adega.findUnique({
      where: { id },
      include: {
        tvDevices: true,
        mediaFiles: { where: { status: 'READY' }, orderBy: { createdAt: 'desc' } },
        schedules: { where: { isActive: true } },
        playlists: { where: { isActive: true } },
        campaigns: { where: { isActive: true } },
      },
    });
    if (!adega) throw new NotFoundException('Adega not found');
    return adega;
  }

  async create(dto: CreateAdegaDto, userId?: string) {
    let companyId = dto.companyId;

    if (!companyId && userId) {
      const existing = await this.prisma.company.findFirst({ where: { userId } });
      if (existing) {
        companyId = existing.id;
      } else {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Usuário não encontrado');
        const company = await this.prisma.company.create({
          data: { userId, name: `${user.name}'s Company` },
        });
        const freePlan = await this.prisma.plan.findFirst({
          where: { status: 'ACTIVE' },
          orderBy: { priceMonthly: 'asc' },
        });
        if (freePlan) {
          const trialDays = parseInt(process.env.TRIAL_DAYS || '3');
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
          await this.prisma.subscription.create({
            data: {
              companyId: company.id,
              planId: freePlan.id,
              status: 'TRIAL',
              trialEndsAt,
            },
          });
        }
        companyId = company.id;
      }
    }

    if (!companyId) {
      throw new BadRequestException('companyId é obrigatório');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }
    if (userId && company.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para criar adegas nesta empresa');
    }

    const sub = company.subscriptions[0];
    if (sub) {
      const currentAdegas = await this.prisma.adega.count({ where: { companyId } });
      const maxAdegas = sub.plan?.maxAdegas || 1;
      if (currentAdegas >= maxAdegas) {
        throw new BadRequestException(`Limite de ${maxAdegas} ${maxAdegas === 1 ? 'adega' : 'adegas'} atingido no seu plano`);
      }
    }

    return this.prisma.adega.create({
      data: {
        name: dto.name,
        companyId,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        phone: dto.phone,
        openingHours: dto.openingHours || null,
      },
    });
  }

  async update(id: string, data: Partial<CreateAdegaDto>) {
    await this.findById(id);
    return this.prisma.adega.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.adega.delete({ where: { id } });
    return { message: 'Adega deleted' };
  }

  async getSubscriptionStatus(adegaId: string) {
    const adega = await this.prisma.adega.findUnique({
      where: { id: adegaId },
      include: {
        company: {
          include: {
            subscriptions: {
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
    if (!adega) throw new NotFoundException('Adega not found');
    const sub = adega.company.subscriptions[0];
    if (!sub) return { status: 'NO_SUBSCRIPTION', blocked: true };
    return {
      status: sub.status,
      plan: sub.plan?.name,
      trialEndsAt: sub.trialEndsAt,
      blocked: sub.status === 'EXPIRED' || sub.status === 'BLOCKED',
    };
  }
}
