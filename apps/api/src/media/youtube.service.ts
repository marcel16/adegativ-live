import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class YoutubeService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async importVideo(url: string, adegaId: string) {
    if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/)) {
      throw new BadRequestException('URL do YouTube inválida');
    }

    const adega = await this.prisma.adega.findUnique({
      where: { id: adegaId },
      include: { company: { include: { subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 } } } },
    });
    if (!adega) throw new NotFoundException('Adega não encontrada');
    const plan = adega.company?.subscriptions?.[0]?.plan;
    if (!plan?.hasYoutubeImport) {
      throw new BadRequestException('Seu plano não inclui importação do YouTube. Faça upgrade para usar este recurso.');
    }

    try {
      const info = this.getVideoInfo(url);
      const fileName = `${uuidv4()}.mp4`;
      const outputPath = path.join(this.uploadDir, fileName);

      execSync(
        `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" ` +
        `--merge-output-format mp4 ` +
        `-o "${outputPath}" ` +
        `"${url}"`,
        { timeout: 600000, stdio: 'pipe' },
      );

      const stats = fs.statSync(outputPath);
      const mediaType = info.isLive ? 'VIDEO' : 'VIDEO';

      const media = await this.prisma.mediaFile.create({
        data: {
          adegaId,
          name: info.title || 'YouTube Video',
          originalName: info.title || 'YouTube Video',
          mimeType: 'video/mp4',
          size: stats.size,
          type: 'VIDEO' as any,
          status: 'READY',
          url: `/uploads/${fileName}`,
          duration: info.duration || null,
          width: info.width || null,
          height: info.height || null,
          metadata: {
            source: 'youtube',
            youtubeUrl: url,
            youtubeId: info.id,
            channel: info.channel,
            thumbnail: info.thumbnail,
          },
        },
      });

      await this.updateStorageUsage(adegaId);
      return media;
    } catch (err: any) {
      throw new BadRequestException(`Erro ao importar vídeo: ${err.message}`);
    }
  }

  private getVideoInfo(url: string) {
    try {
      const output = execSync(
        `yt-dlp --dump-json --no-download "https://www.youtube.com/watch?v=${this.extractVideoId(url)}"`,
        { timeout: 30000, encoding: 'utf-8', stdio: 'pipe' },
      );
      const data = JSON.parse(output.trim().split('\n')[0]);
      return {
        id: data.id,
        title: data.title,
        duration: data.duration,
        width: data.width,
        height: data.height,
        channel: data.channel,
        thumbnail: data.thumbnail,
        isLive: data.is_live || false,
      };
    } catch {
      const output = execSync(
        `yt-dlp --dump-json --no-download "${url}"`,
        { timeout: 30000, encoding: 'utf-8', stdio: 'pipe' },
      );
      const data = JSON.parse(output.trim().split('\n')[0]);
      return {
        id: data.id,
        title: data.title,
        duration: data.duration,
        width: data.width,
        height: data.height,
        channel: data.channel,
        thumbnail: data.thumbnail,
        isLive: data.is_live || false,
      };
    }
  }

  private extractVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    throw new BadRequestException('Não foi possível extrair o ID do vídeo');
  }

  async listFormats(url: string) {
    try {
      const output = execSync(
        `yt-dlp -F --no-download "${url}"`,
        { timeout: 15000, encoding: 'utf-8', stdio: 'pipe' },
      );
      return { formats: output };
    } catch (err: any) {
      throw new BadRequestException(`Erro ao listar formatos: ${err.message}`);
    }
  }

  private async updateStorageUsage(adegaId: string) {
    const result = await this.prisma.mediaFile.aggregate({
      where: { adegaId },
      _sum: { size: true },
      _count: true,
    });
    await this.prisma.storageUsage.upsert({
      where: { adegaId },
      create: { adegaId, totalBytes: BigInt(result._sum.size || 0), filesCount: result._count },
      update: { totalBytes: BigInt(result._sum.size || 0), filesCount: result._count },
    });
  }
}
