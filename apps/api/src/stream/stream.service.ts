import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StreamService {
  constructor(private prisma: PrismaService) {}

  async getStreamPlaylist(code: string) {
    const adega = await this.prisma.adega.findUnique({
      where: { streamCode: code },
      include: {
        schedules: {
          where: { isActive: true },
          include: {
            items: {
              where: { isActive: true, mediaFile: { type: 'VIDEO' } },
              include: { mediaFile: true },
              orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
            },
          },
        },
        mediaFiles: { where: { status: 'READY', type: 'VIDEO' }, orderBy: { createdAt: 'desc' }, take: 50 },
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
    if (!adega) throw new NotFoundException('Stream code not found');

    const sub = adega.company?.subscriptions?.[0];
    if (sub?.status === 'EXPIRED' || sub?.status === 'BLOCKED') {
      return { blocked: true, videos: [] };
    }

    let videos = adega.schedules?.flatMap(s => s.items).map(i => i.mediaFile).filter((v): v is NonNullable<typeof v> => v !== null) || [];
    if (videos.length === 0) {
      videos = (adega.mediaFiles || []).filter((v): v is NonNullable<typeof v> => v !== null);
    }

    return {
      adegaId: adega.id,
      name: adega.name,
      blocked: false,
      videos: videos.map(v => ({
        url: v.url,
        name: v.name,
        duration: v.duration,
      })),
    };
  }

  async findAllStreamCodes() {
    const adegas = await this.prisma.adega.findMany({
      where: { streamCode: { not: null }, isActive: true },
      select: { name: true, streamCode: true },
    });
    return adegas.filter(a => a.streamCode).map(a => ({
      name: a.name,
      code: a.streamCode,
    }));
  }

  async generateCode(adegaId: string) {
    const adega = await this.prisma.adega.findUnique({ where: { id: adegaId } });
    if (!adega) throw new NotFoundException('Adega not found');

    let code = '';
    let exists = true;
    while (exists) {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      exists = !!(await this.prisma.adega.findUnique({ where: { streamCode: code } }));
    }

    await this.prisma.adega.update({ where: { id: adegaId }, data: { streamCode: code } });
    return { streamCode: code };
  }
}
