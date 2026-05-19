import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, adegaId: string, tags?: string[]) {
    const maxSize = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '500') * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`File exceeds max size of ${maxSize / 1024 / 1024}MB`);
    }

    const allowedMimes = ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const mediaType = file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
    const fileUrl = `/uploads/${fileName}`;

    const media = await this.prisma.mediaFile.create({
      data: {
        adegaId,
        name: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: mediaType as any,
        status: 'READY',
        url: fileUrl,
        tags: tags || [],
      },
    });

    await this.updateStorageUsage(adegaId);

    return media;
  }

  async findAll(adegaId: string, folder?: string) {
    return this.prisma.mediaFile.findMany({
      where: { adegaId, folder: folder || undefined },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const media = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async delete(id: string) {
    const media = await this.findById(id);
    if (media.url) {
      const filePath = path.join(this.uploadDir, path.basename(media.url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await this.prisma.mediaFile.delete({ where: { id } });
    await this.updateStorageUsage(media.adegaId);
    return { message: 'Media deleted' };
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
