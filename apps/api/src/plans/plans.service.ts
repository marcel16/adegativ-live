import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(data: {
    name: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    annualDiscountPercent?: number;
    maxTvs: number;
    maxAdegas?: number;
    maxStorageGb: number;
    maxDurationSec?: number;
    hasScheduling?: boolean;
    hasAnalytics?: boolean;
    hasYoutubeImport?: boolean;
    hasAiFeatures?: boolean;
    features?: any;
    isHighlighted?: boolean;
    status?: string;
    sortOrder?: number;
  }) {
    return this.prisma.plan.create({ data: data as any });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.plan.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.plan.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  async getSubscription(companyId: string) {
    return this.prisma.subscription.findFirst({
      where: { companyId },
      include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkAndBlockExpiredTrials() {
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: { lt: new Date() },
      },
    });

    for (const sub of expired) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' },
      });
    }

    return { blocked: expired.length };
  }
}
