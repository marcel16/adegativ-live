import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async findAll(adegaId: string) {
    return this.prisma.schedule.findMany({
      where: { adegaId },
      include: {
        items: {
          include: { mediaFile: true, playlist: true, campaign: true },
          orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        items: {
          include: { mediaFile: true, playlist: true, campaign: true },
          orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
        },
      },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async create(data: {
    adegaId: string;
    name: string;
    startDate?: string;
    endDate?: string;
    loopMode?: string;
  }) {
    return this.prisma.schedule.create({
      data: {
        adegaId: data.adegaId,
        name: data.name,
        loopMode: (data.loopMode as any) || 'SEQUENTIAL',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.schedule.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Schedule deleted' };
  }

  async addItem(scheduleId: string, data: {
    mediaFileId?: string;
    playlistId?: string;
    campaignId?: string;
    tvDeviceId?: string;
    priority?: string;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    duration?: number;
    sortOrder?: number;
  }) {
    await this.findById(scheduleId);
    return this.prisma.scheduleItem.create({
      data: {
        scheduleId,
        mediaFileId: data.mediaFileId,
        playlistId: data.playlistId,
        campaignId: data.campaignId,
        tvDeviceId: data.tvDeviceId,
        priority: (data.priority as any) || 'NORMAL',
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async removeItem(itemId: string) {
    await this.prisma.scheduleItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }

  async updateItem(itemId: string, data: any) {
    return this.prisma.scheduleItem.update({ where: { id: itemId }, data });
  }
}
