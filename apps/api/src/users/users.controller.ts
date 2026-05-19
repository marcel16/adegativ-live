import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  updateProfile(@CurrentUser() user: any, @Body() data: { name?: string; phone?: string }) {
    return this.usersService.updateProfile(user.id, data);
  }

  @Get('companies')
  getCompanies(@CurrentUser() user: any) {
    return this.usersService.getCompanies(user.id);
  }
}
