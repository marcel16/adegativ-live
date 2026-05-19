import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Ip } from '@nestjs/common';
import { TVService } from './tv.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tv')
export class TVController {
  constructor(private tvService: TVService) {}

  @Post('pairing/generate')
  generateCode(@Body('platform') platform: string, @Body('model') model?: string, @Ip() ip?: string) {
    return this.tvService.generatePairingCode(platform, model, ip);
  }

  @Post('pairing/confirm')
  @UseGuards(JwtAuthGuard)
  confirmPairing(@Body('code') code: string, @Body('adegaId') adegaId: string) {
    return this.tvService.pairTV(code, adegaId);
  }

  @Get('playlist/:deviceToken')
  getPlaylist(@Param('deviceToken') deviceToken: string, @Ip() ip?: string) {
    return this.tvService.getPlaylistForTV(deviceToken, ip);
  }

  @Post(':id/ping')
  pingTV(@Param('id') id: string, @Ip() ip?: string) {
    return this.tvService.pingTV(id, ip);
  }

  @Get('adega/:adegaId')
  @UseGuards(JwtAuthGuard)
  getTVsByAdega(@Param('adegaId') adegaId: string) {
    return this.tvService.getTVsByAdega(adegaId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getTVById(@Param('id') id: string) {
    return this.tvService.getTVById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateTV(@Param('id') id: string, @Body() data: { name?: string; model?: string; resolution?: string }) {
    return this.tvService.updateTV(id, data);
  }

  @Delete(':id/revoke')
  @UseGuards(JwtAuthGuard)
  revokeTV(@Param('id') id: string) {
    return this.tvService.revokeTV(id);
  }
}
