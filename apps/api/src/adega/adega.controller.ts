import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdegaService } from './adega.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateAdegaDto } from './dto/create-adega.dto';

@Controller('adegas')
@UseGuards(JwtAuthGuard)
export class AdegaController {
  constructor(private adegaService: AdegaService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.adegaService.findAll(user.id);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.adegaService.findById(id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateAdegaDto) {
    return this.adegaService.create(dto, user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CreateAdegaDto>) {
    return this.adegaService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.adegaService.delete(id);
  }

  @Get(':id/subscription')
  getSubscription(@Param('id') id: string) {
    return this.adegaService.getSubscriptionStatus(id);
  }
}
