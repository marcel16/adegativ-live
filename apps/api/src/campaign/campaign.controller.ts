import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Get('adega/:adegaId')
  findAll(@Param('adegaId') adegaId: string) {
    return this.campaignService.findAll(adegaId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.campaignService.findById(id);
  }

  @Post()
  create(@Body() data: { adegaId: string; name: string; description?: string; startDate?: string; endDate?: string; isRecurring?: boolean }) {
    return this.campaignService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.campaignService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.campaignService.delete(id);
  }
}
