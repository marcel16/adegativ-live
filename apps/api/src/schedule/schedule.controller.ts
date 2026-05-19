import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get('adega/:adegaId')
  findAll(@Param('adegaId') adegaId: string) {
    return this.scheduleService.findAll(adegaId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @Post()
  create(@Body() data: { adegaId: string; name: string; startDate?: string; endDate?: string }) {
    return this.scheduleService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.scheduleService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() data: any) {
    return this.scheduleService.addItem(id, data);
  }

  @Put('items/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() data: any) {
    return this.scheduleService.updateItem(itemId, data);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.scheduleService.removeItem(itemId);
  }
}
