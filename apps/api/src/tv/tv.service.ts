import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TVService {
  constructor(private prisma: PrismaService) {}

  async generatePairingCode(platform: string, model?: string, ip?: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const deviceToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const tvDevice = await this.prisma.tVDevice.create({
      data: {
        platform: platform as any,
        model,
        deviceToken,
        status: 'PAIRING',
        lastIp: ip,
      },
    });

    await this.prisma.pairingCode.create({
      data: {
        code,
        tvDeviceId: tvDevice.id,
        expiresAt,
      },
    });

    return { code, deviceToken, tvDeviceId: tvDevice.id, expiresAt };
  }

  async pairTV(code: string, adegaId: string) {
    const pairing = await this.prisma.pairingCode.findUnique({
      where: { code },
      include: { tvDevice: true },
    });

    if (!pairing) throw new NotFoundException('Invalid pairing code');
    if (pairing.usedAt) throw new BadRequestException('Code already used');
    if (pairing.expiresAt < new Date()) throw new BadRequestException('Code expired');

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
    if (sub && (sub.status === 'EXPIRED' || sub.status === 'BLOCKED')) {
      throw new BadRequestException('Subscription is not active');
    }

    const currentTvCount = await this.prisma.tVDevice.count({ where: { adegaId } });
    const maxTvs = sub?.plan?.maxTvs || 2;
    if (currentTvCount >= maxTvs) {
      throw new BadRequestException(`Maximum of ${maxTvs} TVs reached for your plan`);
    }

    const tvSessionToken = uuidv4();
    const sessionExpires = new Date();
    sessionExpires.setFullYear(sessionExpires.getFullYear() + 1);

    await this.prisma.$transaction([
      this.prisma.pairingCode.update({
        where: { id: pairing.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.tVDevice.update({
        where: { id: pairing.tvDeviceId },
        data: {
          adegaId,
          status: 'ONLINE',
          name: `TV ${currentTvCount + 1}`,
        },
      }),
      this.prisma.deviceSession.upsert({
        where: { tvDeviceId: pairing.tvDeviceId },
        create: { tvDeviceId: pairing.tvDeviceId, token: tvSessionToken, expiresAt: sessionExpires },
        update: { token: tvSessionToken, expiresAt: sessionExpires },
      }),
      this.prisma.storageUsage.upsert({
        where: { adegaId },
        create: { adegaId, totalBytes: 0n, filesCount: 0 },
        update: {},
      }),
    ]);

    return { tvDeviceId: pairing.tvDeviceId, token: tvSessionToken, message: 'TV paired successfully' };
  }

  async getTVsByAdega(adegaId: string) {
    return this.prisma.tVDevice.findMany({
      where: { adegaId },
      include: { deviceSession: { select: { token: true } } },
    });
  }

  async getTVById(id: string) {
    const tv = await this.prisma.tVDevice.findUnique({
      where: { id },
      include: { deviceSession: true, pairingCode: true },
    });
    if (!tv) throw new NotFoundException('TV not found');
    return tv;
  }

  async updateTV(id: string, data: { name?: string; model?: string; resolution?: string }) {
    return this.prisma.tVDevice.update({ where: { id }, data });
  }

  async revokeTV(id: string) {
    await this.prisma.$transaction([
      this.prisma.deviceSession.deleteMany({ where: { tvDeviceId: id } }),
      this.prisma.pairingCode.deleteMany({ where: { tvDeviceId: id } }),
      this.prisma.tVDevice.update({
        where: { id },
        data: { adegaId: null as any, status: 'PAIRING' },
      }),
    ]);
    return { message: 'TV access revoked' };
  }

  async pingTV(id: string, ip?: string) {
    await this.prisma.tVDevice.update({
      where: { id },
      data: { lastAccessAt: new Date(), status: 'ONLINE', lastIp: ip || undefined },
    });
    return { status: 'ok' };
  }

  async getPlaylistForTV(deviceToken: string, ip?: string) {
    const tv = await this.prisma.tVDevice.findFirst({
      where: { deviceToken },
      include: {
        adega: {
          include: {
            schedules: {
              where: { isActive: true },
              include: {
                items: {
                  where: { isActive: true },
                  include: { mediaFile: true, campaign: true },
                  orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
                },
              },
            },
            mediaFiles: { where: { status: 'READY' }, orderBy: { createdAt: 'desc' }, take: 50 },
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
        },
      },
    });

    if (!tv) throw new NotFoundException('TV not found or not paired');

    if (ip) {
      await this.prisma.tVDevice.update({ where: { id: tv.id }, data: { lastIp: ip, lastAccessAt: new Date() } });
    }

    const sub = tv.adega?.company?.subscriptions?.[0];
    const isBlocked = sub?.status === 'EXPIRED' || sub?.status === 'BLOCKED';

    let playlist = tv.adega?.schedules?.flatMap(s => s.items) || [];
    const fallbackMedia = tv.adega?.mediaFiles || [];

    if (tv.adega?.schedules?.some(s => s.loopMode === 'RANDOM')) {
      playlist = [...playlist].sort(() => Math.random() - 0.5);
    }

    return {
      tvId: tv.id,
      name: tv.name,
      blocked: isBlocked,
      blockedMessage: isBlocked ? 'Assinatura vencida. Renove seu plano para continuar exibindo.' : null,
      schedule: playlist.map(item => ({
        id: item.id,
        mediaFile: item.mediaFile ? {
          id: item.mediaFile.id,
          url: item.mediaFile.url,
          type: item.mediaFile.type,
          duration: item.mediaFile.duration,
        } : null,
        campaign: item.campaign ? { name: item.campaign.name } : null,
        priority: item.priority,
        duration: item.duration,
      })),
      fallback: fallbackMedia.map(m => ({
        id: m.id,
        url: m.url,
        type: m.type,
        duration: m.duration || 10,
      })),
    };
  }

  async markOffline() {
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() - 2);
    await this.prisma.tVDevice.updateMany({
      where: { lastAccessAt: { lt: threshold }, status: 'ONLINE' },
      data: { status: 'OFFLINE' },
    });
  }
}
