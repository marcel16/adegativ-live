import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StreamService } from './stream.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
export class StreamController {
  constructor(private streamService: StreamService) {}

  @Get('streams/:code')
  getPlaylist(@Param('code') code: string) {
    return this.streamService.getStreamPlaylist(code);
  }

  @Get('streams')
  listStreams() {
    return this.streamService.findAllStreamCodes();
  }

  @Post('adegas/:id/generate-stream-code')
  @UseGuards(JwtAuthGuard)
  generateCode(@Param('id') id: string) {
    return this.streamService.generateCode(id);
  }
}
