import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  async findAll(adegaId: string) {
    return this.prisma.playlist.findMany({
      where: { adegaId },
      include: { _count: { select: { scheduleItems: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: { scheduleItems: { include: { mediaFile: true } } },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    return playlist;
  }

  async create(data: { adegaId: string; name: string }) {
    return this.prisma.playlist.create({ data });
  }

  async update(id: string, data: { name?: string; isActive?: boolean }) {
    await this.findById(id);
    return this.prisma.playlist.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.playlist.delete({ where: { id } });
    return { message: 'Playlist deleted' };
  }
}
