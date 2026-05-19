import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistController {
  constructor(private playlistService: PlaylistService) {}

  @Get('adega/:adegaId')
  findAll(@Param('adegaId') adegaId: string) {
    return this.playlistService.findAll(adegaId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.playlistService.findById(id);
  }

  @Post()
  create(@Body() data: { adegaId: string; name: string }) {
    return this.playlistService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; isActive?: boolean }) {
    return this.playlistService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.playlistService.delete(id);
  }
}
