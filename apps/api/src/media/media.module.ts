import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { YoutubeService } from './youtube.service';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [MediaService, YoutubeService],
  exports: [MediaService, YoutubeService],
})
export class MediaModule {}
