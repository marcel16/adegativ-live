import {
  Controller, Get, Post, Delete, Param, Query, UseGuards,
  UseInterceptors, UploadedFile, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { YoutubeService } from './youtube.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private youtubeService: YoutubeService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('adegaId') adegaId: string,
    @Body('tags') tags?: string,
  ) {
    return this.mediaService.upload(file, adegaId, tags ? tags.split(',') : []);
  }

  @Get('adega/:adegaId')
  findAll(@Param('adegaId') adegaId: string, @Query('folder') folder?: string) {
    return this.mediaService.findAll(adegaId, folder);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }

  @Post('import/youtube')
  importYoutube(@Body('url') url: string, @Body('adegaId') adegaId: string) {
    return this.youtubeService.importVideo(url, adegaId);
  }

  @Post('import/youtube/info')
  youtubeInfo(@Body('url') url: string) {
    return this.youtubeService.listFormats(url);
  }
}
