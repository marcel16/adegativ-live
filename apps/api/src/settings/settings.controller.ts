import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @Get('group/:group')
  async getByGroup(@Param('group') group: string) {
    return this.settingsService.getByGroup(group);
  }

  @Get(':key')
  async get(@Param('key') key: string) {
    const value = await this.settingsService.get(key);
    return { key, value };
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body() body: { value: string }) {
    await this.settingsService.set(key, body.value);
    await this.settingsService.refreshCache();
    return { message: 'Setting updated' };
  }

  @Put()
  async updateMany(@Body() body: { settings: { key: string; value: string }[] }) {
    for (const s of body.settings) {
      await this.settingsService.set(s.key, s.value);
    }
    await this.settingsService.refreshCache();
    return { message: 'Settings updated' };
  }

  @Delete(':key')
  async delete(@Param('key') key: string) {
    await this.settingsService.delete(key);
    return { message: 'Setting deleted' };
  }
}
